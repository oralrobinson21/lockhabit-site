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

test("expired checkout releases reserved reward path and never creates an order", async () => {
  let released = 0;
  const state = harness(session("unpaid"));
  state.dependencies.releaseReservedReward = async () => {
    released += 1;
  };
  assert.equal(
    await processCheckoutWebhook(event("checkout.session.expired", "evt_expired"), state.dependencies),
    "expired",
  );
  assert.equal(state.orders.size, 0);
  assert.equal(state.emailCount, 0);
  assert.equal(released, 1);
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

test("confirmation includes the required order and payment details", async () => {
  const message = await renderOrderConfirmation({
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
    paidAt: "2026-09-21T20:04:46.000Z",
    discountCode: null,
    discountAmount: 0,
    orderKind: "Order",
  });
  for (const expected of [
    "Maya Rivera",
    "LH-000042",
    "Coconut Beach Soap",
    "Subtotal",
    "Shipping",
    "\\$42\\.95",
    "Amount paid",
    "123 Palm Way",
    "Sep 21, 2026",
    "4:04:46 PM ET",
    "LOCKHABIT ORDER",
    'href="https://lockhabit.com/"',
    "support@lockhabit.com",
    'name="color-scheme" content="light only"',
    "receipt-header.jpg",
    "ink-title.png",
    "cid:lh-ink-",
    "data-ogsb",
  ]) {
    assert.match(message.html, new RegExp(expected));
  }
  assert.doesNotMatch(message.html, /\/api\/email-ink\?/);
  assert.ok(message.attachments.length >= 8, "dynamic values should be CID attachments");
  for (const attachment of message.attachments) {
    assert.equal(attachment.contentType, "image/png");
    assert.match(attachment.contentId, /^lh-ink-\d+$/);
    assert.ok(attachment.content.length > 80, `empty PNG for ${attachment.contentId}`);
    assert.match(message.html, new RegExp(`cid:${attachment.contentId}`));
  }
  assert.doesNotMatch(message.html, /Discount/);
  assert.doesNotMatch(message.html, /Tax/);
  assert.equal(message.subject, "Your LockHabit receipt • LH-000042");
});

test("confirmation shows the applied promotion code and hides empty rows", async () => {
  const message = await renderOrderConfirmation({
    checkoutSessionId: "cs_test_promo",
    orderNumber: 7,
    customerEmail: "buyer@example.com",
    customerName: "Oral",
    currency: "usd",
    subtotal: 8900,
    shipping: 0,
    tax: 0,
    total: 100,
    shippingAddress: null,
    items: [
      { name: "Coconut Beach Soap", quantity: 1, amountTotal: 2967 },
      { name: "Oat Milk Honey Soap", quantity: 1, amountTotal: 2967 },
      { name: "Calming Lavender Soap", quantity: 1, amountTotal: 2966 },
    ],
    paidAt: null,
    discountCode: "LOCKHABIT3FOR1B",
    discountAmount: 8800,
    orderKind: "3-Bar Bundle",
  });
  assert.match(message.html, /Discount code/);
  assert.match(message.html, /LOCKHABIT3FOR1B[\s\S]*\(\$88\.00 off\)/);
  assert.match(message.html, /Free shipping/);
  assert.match(message.html, /LOCKHABIT 3-BAR BUNDLE/);
  assert.match(message.html, /Oat Milk Honey Soap/);
  assert.match(message.html, /ink-label-discount\.png/);
  assert.doesNotMatch(message.html, /SHIPPING TO/);
  assert.match(message.text, /Discount code: LOCKHABIT3FOR1B \(\$88\.00 off\)/);
});

test("synthetic LH-999999 proof embeds CID ink for Outlook (no remote email-ink)", async () => {
  const message = await renderOrderConfirmation(
    {
      checkoutSessionId: "email-template-proof-cid",
      orderNumber: 999999,
      customerEmail: "buyer@example.com",
      customerName: "Oral Robinson",
      currency: "usd",
      subtotal: 8900,
      shipping: 0,
      tax: 0,
      total: 100,
      shippingAddress: {
        line1: "40 W Mosholu Pkwy S",
        city: "Bronx",
        state: "NY",
        postal_code: "10468",
        country: "US",
      },
      items: [{ name: "Build Your Own 3-Bar Bundle", quantity: 1, amountTotal: 8900 }],
      paidAt: "2026-09-21T20:04:46.000Z",
      discountCode: "LOCKHABIT3FOR1B",
      discountAmount: 8800,
      orderKind: "3-Bar Bundle",
    },
    { dynamicInk: "cid" },
  );
  assert.match(message.html, /Build Your Own 3-Bar Bundle × 1/);
  assert.match(message.html, /\$89\.00/);
  assert.match(message.html, /LH-999999/);
  assert.match(message.html, /cid:lh-ink-/);
  assert.doesNotMatch(message.html, /\/api\/email-ink\?/);
  assert.ok(message.attachments.some((a) => a.contentId === "lh-ink-1"));
  const preview = await renderOrderConfirmation(
    {
      checkoutSessionId: "email-template-proof-preview",
      orderNumber: 999999,
      customerEmail: "buyer@example.com",
      customerName: "Oral Robinson",
      currency: "usd",
      subtotal: 8900,
      shipping: 0,
      tax: 0,
      total: 100,
      shippingAddress: null,
      items: [{ name: "Build Your Own 3-Bar Bundle", quantity: 1, amountTotal: 8900 }],
      paidAt: "2026-09-21T20:04:46.000Z",
      discountCode: "LOCKHABIT3FOR1B",
      discountAmount: 8800,
      orderKind: "3-Bar Bundle",
    },
    { dynamicInk: "data" },
  );
  assert.match(preview.html, /src="data:image\/png;base64,/);
  assert.equal(preview.attachments.length, 0);
  assert.doesNotMatch(preview.html, /\/api\/email-ink\?/);
});

test("webhook exposes payment time, promotion code and bundle kind to the confirmation", async () => {
  const promoSession = {
    ...session("paid"),
    mode: "payment",
    amount_subtotal: 8900,
    amount_total: 100,
    total_details: { amount_shipping: 0, amount_tax: 0, amount_discount: 8800 },
    discounts: [{ coupon: "coupon_x", promotion_code: { id: "promo_x", code: "LOCKHABIT3FOR1B" } }],
    metadata: { selected_product_ids: "1,8,9" },
    line_items: {
      data: [{ description: "Build Your Own 3-Bar Bundle", quantity: 1, amount_total: 8900 }],
    },
  } as unknown as Stripe.Checkout.Session;
  let captured: Parameters<WebhookDependencies["sendConfirmationIfPending"]>[0] | undefined;
  const state = harness(promoSession);
  state.dependencies.sendConfirmationIfPending = async (order) => {
    captured = order;
  };
  const paidEvent = {
    ...event("checkout.session.completed", "evt_promo"),
    created: Date.UTC(2026, 8, 21, 20, 4, 46) / 1000,
  } as Stripe.Event;
  assert.equal(await processCheckoutWebhook(paidEvent, state.dependencies), "paid");
  assert.ok(captured);
  assert.equal(captured.paidAt, "2026-09-21T20:04:46.000Z");
  assert.equal(captured.discountCode, "LOCKHABIT3FOR1B");
  assert.equal(captured.discountAmount, 8800);
  assert.equal(captured.orderKind, "3-Bar Bundle");
  assert.deepEqual(
    captured.items.map((item) => item.name),
    ["Coconut Beach Soap", "Oat Milk Honey Soap", "Calming Lavender Soap"],
  );
  assert.equal(
    captured.items.reduce((sum, item) => sum + item.amountTotal, 0),
    8900,
  );
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
      paidAt: "2026-09-21T20:04:46.000Z",
      discountCode: null,
      discountAmount: 0,
      orderKind: "Order",
    });
    assert.equal(providerId, "email_test_1");
    assert.equal(requests.length, 1);
    assert.equal(requests[0]?.url, "https://api.resend.com/emails");
    assert.equal(
      new Headers(requests[0]?.init?.headers).get("Idempotency-Key"),
      "lockhabit-order-cs_test_lockhabit",
    );
    const body = JSON.parse(String(requests[0]?.init?.body)) as {
      html: string;
      attachments?: Array<{ content_id: string; content: string; content_type: string }>;
    };
    assert.match(body.html, /cid:lh-ink-/);
    assert.doesNotMatch(body.html, /\/api\/email-ink\?/);
    assert.ok(body.attachments && body.attachments.length >= 8);
    assert.equal(body.attachments[0]?.content_type, "image/png");
    assert.ok(body.attachments[0]?.content.length > 80);
    assert.match(body.html, new RegExp(`cid:${body.attachments[0]?.content_id}`));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["RESEND_API_KEY"];
    else process.env["RESEND_API_KEY"] = originalApiKey;
    if (originalFrom === undefined) delete process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    else process.env["LOCKHABIT_ORDER_FROM_EMAIL"] = originalFrom;
  }
});

test("confirmation transport preserves a safe Resend rejection message", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["RESEND_API_KEY"];
  const originalFrom = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
  process.env["RESEND_API_KEY"] = "re_test_redacted";
  process.env["LOCKHABIT_ORDER_FROM_EMAIL"] = "LockHabit <orders@example.com>";
  globalThis.fetch = async () =>
    Response.json({ message: "from domain is not verified" }, { status: 422 });

  try {
    await assert.rejects(
      sendOrderConfirmation({
        checkoutSessionId: "cs_test_rejected",
        orderNumber: 43,
        customerEmail: "buyer@example.com",
        customerName: "Maya Rivera",
        currency: "usd",
        subtotal: 3500,
        shipping: 795,
        tax: 0,
        total: 4295,
        shippingAddress: null,
        items: [{ name: "Coconut Beach Soap", quantity: 1, amountTotal: 3500 }],
        paidAt: "2026-09-21T20:04:46.000Z",
        discountCode: null,
        discountAmount: 0,
        orderKind: "Order",
      }),
      /422.*from domain is not verified/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["RESEND_API_KEY"];
    else process.env["RESEND_API_KEY"] = originalApiKey;
    if (originalFrom === undefined) delete process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    else process.env["LOCKHABIT_ORDER_FROM_EMAIL"] = originalFrom;
  }
});
