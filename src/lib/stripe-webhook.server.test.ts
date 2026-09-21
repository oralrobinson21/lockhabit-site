import assert from "node:assert/strict";
import { test } from "node:test";
import type Stripe from "stripe";

import { renderOrderConfirmation, sendOrderConfirmation } from "./order-confirmation-email.server";
import { processCheckoutWebhook, type WebhookDependencies } from "./stripe-webhook.server";

const session = (paymentStatus: Stripe.Checkout.Session["payment_status"]) =>
  ({
    id: "cs_test_lockhabit",
    payment_status: paymentStatus,
    payment_intent: "pi_test_lockhabit",
    customer_details: { email: "buyer@example.com", name: "Maya Rivera" },
    collected_information: {
      shipping_details: {
        name: "Maya Rivera",
        address: {
          line1: "123 Palm Way",
          line2: null,
          city: "Bronx",
          state: "NY",
          postal_code: "10451",
          country: "US",
        },
      },
    },
    currency: "usd",
    amount_subtotal: 3500,
    amount_total: 4295,
    total_details: { amount_shipping: 795, amount_tax: 0, amount_discount: 0 },
    line_items: {
      data: [{ description: "Coconut Beach Soap", quantity: 1, amount_total: 3500 }],
    },
  }) as Stripe.Checkout.Session;

const event = (type: Stripe.Event.Type, id: string) =>
  ({ id, type, data: { object: { id: "cs_test_lockhabit" } } }) as Stripe.Event;

function harness(currentSession: Stripe.Checkout.Session) {
  const orders = new Map<string, { order_id: string; order_number: number }>();
  const claimed = new Set<string>();
  let emailCount = 0;
  let nonPaidCount = 0;
  const dependencies: WebhookDependencies = {
    retrieveSession: async () => currentSession,
    recordPaidOrder: async (_event, checkout) => {
      if (!orders.has(checkout.id)) {
        orders.set(checkout.id, { order_id: "order-1", order_number: 1 });
      }
      return orders.get(checkout.id)!;
    },
    recordNonPaidEvent: async () => {
      nonPaidCount += 1;
    },
    sendConfirmationIfPending: async (order) => {
      if (claimed.has(order.checkoutSessionId)) return;
      claimed.add(order.checkoutSessionId);
      emailCount += 1;
    },
  };
  return {
    dependencies,
    orders,
    get emailCount() {
      return emailCount;
    },
    get nonPaidCount() {
      return nonPaidCount;
    },
  };
}

test("paid webhook replay creates one order and sends one confirmation", async () => {
  const state = harness(session("paid"));
  const stripeEvent = event("checkout.session.completed", "evt_success");
  assert.equal(await processCheckoutWebhook(stripeEvent, state.dependencies), "paid");
  assert.equal(await processCheckoutWebhook(stripeEvent, state.dependencies), "paid");
  assert.equal(state.orders.size, 1);
  assert.equal(state.emailCount, 1);
});

test("paid webhook succeeds when confirmation delivery is unavailable", async () => {
  const state = harness(session("paid"));
  state.dependencies.sendConfirmationIfPending = async () => {
    throw new Error("Order confirmation email is not configured");
  };
  assert.equal(
    await processCheckoutWebhook(
      event("checkout.session.completed", "evt_email_unconfigured"),
      state.dependencies,
    ),
    "paid",
  );
  assert.equal(state.orders.size, 1);
});

test("failed asynchronous payment never creates an order or sends confirmation", async () => {
  const state = harness(session("unpaid"));
  assert.equal(
    await processCheckoutWebhook(
      event("checkout.session.async_payment_failed", "evt_failed"),
      state.dependencies,
    ),
    "payment_failed",
  );
  assert.equal(state.orders.size, 0);
  assert.equal(state.emailCount, 0);
  assert.equal(state.nonPaidCount, 1);
});

test("delayed payment confirms only after async success", async () => {
  const pending = session("unpaid");
  const state = harness(pending);
  assert.equal(
    await processCheckoutWebhook(
      event("checkout.session.completed", "evt_pending"),
      state.dependencies,
    ),
    "payment_pending",
  );
  assert.equal(state.emailCount, 0);
  pending.payment_status = "paid";
  assert.equal(
    await processCheckoutWebhook(
      event("checkout.session.async_payment_succeeded", "evt_async_paid"),
      state.dependencies,
    ),
    "paid",
  );
  assert.equal(state.orders.size, 1);
  assert.equal(state.emailCount, 1);
});

test("confirmation includes the required order and payment details", () => {
  const message = renderOrderConfirmation({
    checkoutSessionId: "cs_test_lockhabit",
    orderNumber: 42,
    customerEmail: "buyer@example.com",
    customerName: "Maya Rivera",
    currency: "usd",
    subtotal: 3500,
    shipping: 795,
    tax: 0,
    total: 4295,
    shippingAddress: {
      line1: "123 Palm Way",
      line2: null,
      city: "Bronx",
      state: "NY",
      postal_code: "10451",
      country: "US",
    },
    items: [{ name: "Coconut Beach Soap", quantity: 1, amountTotal: 3500 }],
  });
  for (const expected of [
    "Maya",
    "LH-000042",
    "Coconut Beach Soap",
    "Subtotal",
    "Shipping",
    "Tax",
    "Total paid",
    "123 Palm Way",
    "Payment confirmed by Stripe",
  ]) {
    assert.match(message.html, new RegExp(expected));
  }
});

test("confirmation transport uses Resend with a stable per-order idempotency key", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["RESEND_API_KEY"];
  const originalFrom = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
  const requests: Array<{ url: string; init: RequestInit | undefined }> = [];
  process.env["RESEND_API_KEY"] = "re_test_redacted";
  process.env["LOCKHABIT_ORDER_FROM_EMAIL"] = "LockHabit <orders@example.com>";
  globalThis.fetch = async (input, init) => {
    requests.push({ url: input.toString(), init });
    return Response.json({ id: "email_test_1" });
  };

  try {
    const providerId = await sendOrderConfirmation({
      checkoutSessionId: "cs_test_lockhabit",
      orderNumber: 42,
      customerEmail: "buyer@example.com",
      customerName: "Maya Rivera",
      currency: "usd",
      subtotal: 3500,
      shipping: 795,
      tax: 0,
      total: 4295,
      shippingAddress: { line1: "123 Palm Way", city: "Bronx", state: "NY" },
      items: [{ name: "Coconut Beach Soap", quantity: 1, amountTotal: 3500 }],
    });
    assert.equal(providerId, "email_test_1");
    assert.equal(requests.length, 1);
    assert.equal(requests[0]?.url, "https://api.resend.com/emails");
    assert.equal(
      new Headers(requests[0]?.init?.headers).get("Idempotency-Key"),
      "lockhabit-order-cs_test_lockhabit",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["RESEND_API_KEY"];
    else process.env["RESEND_API_KEY"] = originalApiKey;
    if (originalFrom === undefined) delete process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    else process.env["LOCKHABIT_ORDER_FROM_EMAIL"] = originalFrom;
  }
});
