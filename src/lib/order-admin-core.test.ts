import assert from "node:assert/strict";
import test from "node:test";

import {
  createOrderAdminService,
  type OrderAdminDependencies,
  type TrackingOrder,
} from "./order-admin-core";

type OrderView = { id: string };

function testDependencies(overrides: Partial<OrderAdminDependencies<OrderView>> = {}) {
  const calls = {
    claims: [] as string[],
    loginEmails: [] as Array<{ to: string; link: string; idempotencyKey: string }>,
    persistedTracking: [] as Array<{
      orderId: string;
      carrier: "USPS" | "UPS" | "FedEx" | "DHL";
      trackingNumber: string;
      trackingUrl: string;
      shippedAt: string;
    }>,
    trackingEmails: [] as Array<{
      to: string;
      orderNumber: number;
      carrier: "USPS" | "UPS" | "FedEx" | "DHL";
      trackingNumber: string;
      trackingUrl: string;
      idempotencyKey: string;
    }>,
    notified: [] as Array<{
      orderId: string;
      carrier: "USPS" | "UPS" | "FedEx" | "DHL";
      trackingNumber: string;
      notifiedAt: string;
    }>,
    refundModes: [] as Array<"sandbox" | "live">,
    nonFatalErrors: [] as string[],
    listOrders: 0,
    trackingReads: 0,
    paymentReads: 0,
  };
  const paidOrder: TrackingOrder = {
    id: "order-1",
    orderNumber: 42,
    customerEmail: "customer@example.com",
    paymentStatus: "paid",
    trackingCarrier: null,
    trackingNumber: null,
    trackingNotifiedAt: null,
  };
  const dependencies: OrderAdminDependencies<OrderView> = {
    adminEmail: () => "Owner@Example.com ",
    now: () => new Date("2026-09-23T16:45:30.000Z"),
    getUser: async () => ({
      email: "owner@example.com",
      emailConfirmedAt: "2026-09-23T16:00:00.000Z",
    }),
    claimLogin: async (email) => {
      calls.claims.push(email);
      return true;
    },
    createMagicLinkHash: async () => "hash/value?one-time",
    sendLoginEmail: async (message) => {
      calls.loginEmails.push(message);
    },
    listOrders: async () => {
      calls.listOrders += 1;
      return [{ id: "order-1" }];
    },
    findTrackingOrder: async () => {
      calls.trackingReads += 1;
      return paidOrder;
    },
    persistTracking: async (input) => {
      calls.persistedTracking.push(input);
    },
    sendTrackingEmail: async (message) => {
      calls.trackingEmails.push(message);
      return true;
    },
    markTrackingNotified: async (input) => {
      calls.notified.push(input);
    },
    findPaymentReference: async () => {
      calls.paymentReads += 1;
      return { paymentIntentId: "pi_example", stripeLivemode: true };
    },
    listRefunds: async (_paymentIntentId, mode) => {
      calls.refundModes.push(mode);
      return [];
    },
    defaultStripeMode: () => "live",
    onNonFatalError: (context) => calls.nonFatalErrors.push(context),
    ...overrides,
  };
  return { service: createOrderAdminService(dependencies), calls, paidOrder };
}

test("owner authorization requires the exact confirmed configured email", async () => {
  const wrongEmail = testDependencies({
    getUser: async () => ({
      email: "somebody@example.com",
      emailConfirmedAt: "2026-09-23T16:00:00.000Z",
    }),
  });
  await assert.rejects(
    wrongEmail.service.readAdminOrders("access-token"),
    /Owner sign-in is required/,
  );
  assert.equal(wrongEmail.calls.listOrders, 0);

  const unconfirmed = testDependencies({
    getUser: async () => ({ email: "owner@example.com", emailConfirmedAt: null }),
  });
  await assert.rejects(
    unconfirmed.service.readAdminOrders("access-token"),
    /Owner sign-in is required/,
  );
  assert.equal(unconfirmed.calls.listOrders, 0);

  const owner = testDependencies();
  assert.deepEqual(await owner.service.readAdminOrders("access-token"), [{ id: "order-1" }]);
  assert.equal(owner.calls.listOrders, 1);
});

test("sign-in requests do not reveal or email non-owner addresses", async () => {
  const { service, calls } = testDependencies();
  await service.emailOrderAdminLink("not-the-owner@example.com");
  assert.deepEqual(calls.claims, []);
  assert.deepEqual(calls.loginEmails, []);
});

test("owner sign-in uses a throttled one-time token in the URL fragment", async () => {
  const { service, calls } = testDependencies();
  await service.emailOrderAdminLink(" OWNER@example.com ");
  assert.deepEqual(calls.claims, ["owner@example.com"]);
  assert.equal(calls.loginEmails.length, 1);
  assert.equal(calls.loginEmails[0]?.to, "owner@example.com");
  assert.equal(
    calls.loginEmails[0]?.link,
    "https://lockhabit.com/admin/orders#token_hash=hash%2Fvalue%3Fone-time",
  );
  assert.ok(!calls.loginEmails[0]?.link.includes("?token_hash="));
  assert.match(calls.loginEmails[0]?.idempotencyKey ?? "", /^lockhabit-admin-login-\d+$/);

  const throttled = testDependencies({ claimLogin: async () => false });
  await throttled.service.emailOrderAdminLink("owner@example.com");
  assert.equal(throttled.calls.loginEmails.length, 0);
});

test("tracking is persisted, sent once, and marked against the same carrier and number", async () => {
  const { service, calls } = testDependencies();
  const result = await service.saveAdminTracking(
    "access-token",
    "order-1",
    "UPS",
    " 1Z999 AA10123456784 ",
  );
  assert.equal(result.saved, true);
  assert.equal(result.notified, true);
  assert.equal(calls.persistedTracking[0]?.trackingNumber, "1Z999AA10123456784");
  assert.match(calls.persistedTracking[0]?.trackingUrl ?? "", /^https:\/\/www\.ups\.com\/track\?/);
  assert.equal(
    calls.trackingEmails[0]?.idempotencyKey,
    "lockhabit-shipping-order-1-UPS-1Z999AA10123456784",
  );
  assert.deepEqual(calls.notified[0], {
    orderId: "order-1",
    carrier: "UPS",
    trackingNumber: "1Z999AA10123456784",
    notifiedAt: "2026-09-23T16:45:30.000Z",
  });
});

test("an already-notified tracking number is idempotent", async () => {
  const { service, calls, paidOrder } = testDependencies({
    findTrackingOrder: async () => ({
      ...paidOrder,
      trackingCarrier: "USPS",
      trackingNumber: "940010000000",
      trackingNotifiedAt: "2026-09-23T16:00:00.000Z",
    }),
  });
  const result = await service.saveAdminTracking("access-token", "order-1", "USPS", "940010000000");
  assert.equal(result.notified, true);
  assert.equal(calls.persistedTracking.length, 0);
  assert.equal(calls.trackingEmails.length, 0);
});

test("tracking rejects unpaid orders and injected tracking values before any write", async () => {
  const invalid = testDependencies();
  await assert.rejects(
    invalid.service.saveAdminTracking(
      "access-token",
      "order-1",
      "UPS",
      "https://attacker.example/<script>",
    ),
    /valid tracking number/,
  );
  assert.equal(invalid.calls.trackingReads, 0);
  assert.equal(invalid.calls.persistedTracking.length, 0);

  const unpaid = testDependencies({
    findTrackingOrder: async () => ({
      id: "order-1",
      orderNumber: 42,
      customerEmail: "customer@example.com",
      paymentStatus: "unpaid",
      trackingCarrier: null,
      trackingNumber: null,
      trackingNotifiedAt: null,
    }),
  });
  await assert.rejects(
    unpaid.service.saveAdminTracking("access-token", "order-1", "USPS", "940010000000"),
    /paid order was not found/,
  );
  assert.equal(unpaid.calls.persistedTracking.length, 0);
});

test("tracking email failure does not roll back the saved shipment", async () => {
  const { service, calls } = testDependencies({
    sendTrackingEmail: async () => {
      throw new Error("provider unavailable");
    },
  });
  const result = await service.saveAdminTracking(
    "access-token",
    "order-1",
    "FedEx",
    "123456789012",
  );
  assert.equal(result.saved, true);
  assert.equal(result.notified, false);
  assert.equal(calls.persistedTracking.length, 1);
  assert.deepEqual(calls.nonFatalErrors, ["tracking email delivery"]);
});

test("refund lookup uses the Stripe mode stored with each order", async () => {
  const live = testDependencies();
  const liveResult = await live.service.readAdminRefunds("access-token", "order-1");
  assert.deepEqual(live.calls.refundModes, ["live"]);
  assert.equal(liveResult.stripeUrl, "https://dashboard.stripe.com/payments/pi_example");

  const testMode = testDependencies({
    findPaymentReference: async () => ({
      paymentIntentId: "pi_test_example",
      stripeLivemode: false,
    }),
  });
  const testResult = await testMode.service.readAdminRefunds("access-token", "order-1");
  assert.deepEqual(testMode.calls.refundModes, ["sandbox"]);
  assert.equal(testResult.stripeUrl, "https://dashboard.stripe.com/test/payments/pi_test_example");

  const legacy = testDependencies({
    findPaymentReference: async () => ({
      paymentIntentId: "pi_legacy",
      stripeLivemode: null,
    }),
    defaultStripeMode: () => "sandbox",
  });
  await legacy.service.readAdminRefunds("access-token", "order-1");
  assert.deepEqual(legacy.calls.refundModes, ["sandbox"]);
});
