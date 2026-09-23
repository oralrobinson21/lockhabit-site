import assert from "node:assert/strict";
import test from "node:test";

import { buildGa4PurchasePayload, trackGa4PurchaseOnce } from "./ga4-purchase";
import { isMarketingEligibleCheckout } from "./product-selection";

test("GA4 purchase value excludes shipping and tax while retaining item data", () => {
  assert.deepEqual(
    buildGa4PurchasePayload({
      transactionId: "pi_paid_123",
      totalCents: 4565,
      shippingCents: 795,
      taxCents: 270,
      currency: "usd",
      items: [{ productId: 1, name: "Coconut Beach Soap", quantity: 1, amountTotal: 3500 }],
    }),
    {
      transaction_id: "pi_paid_123",
      currency: "USD",
      value: 35,
      shipping: 7.95,
      tax: 2.7,
      items: [{ item_id: "1", item_name: "Coconut Beach Soap", quantity: 1, price: 35 }],
    },
  );
});

test("GA4 purchase uses the discounted actual order value, not catalog list prices", () => {
  const purchase = buildGa4PurchasePayload({
    transactionId: "pi_discount_456",
    totalCents: 8900,
    shippingCents: 0,
    taxCents: 0,
    currency: "usd",
    items: [
      { productId: 1, name: "Coconut Beach Soap", quantity: 1, amountTotal: 2967 },
      { productId: 4, name: "Slumber Soap", quantity: 1, amountTotal: 2967 },
      { productId: 10, name: "Charcoal Soap", quantity: 1, amountTotal: 2966 },
    ],
  });
  assert.equal(purchase.value, 89);
  assert.equal(purchase.items.length, 3);
  assert.deepEqual(purchase.items.map((item) => item.item_id), ["1", "4", "10"]);
});

test("GA4 purchase is queued once per session and absent without gtag", () => {
  const calls: unknown[][] = [];
  const stored = new Map<string, string>();
  const globalWithWindow = globalThis as unknown as { window?: unknown };
  const previous = globalWithWindow.window;
  const mockWindow = {
    localStorage: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    },
    gtag: (...args: unknown[]) => calls.push(args),
  };
  globalWithWindow.window = mockWindow;
  try {
    const payload = buildGa4PurchasePayload({
      transactionId: "pi_test",
      totalCents: 3500,
      shippingCents: 0,
      taxCents: 0,
      currency: "usd",
      items: [{ name: "Bar", quantity: 1, amountTotal: 3500 }],
    });
    trackGa4PurchaseOnce("cs_paid_1", payload);
    trackGa4PurchaseOnce("cs_paid_1", payload);
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.[0], "event");
    assert.equal(calls[0]?.[1], "purchase");
    delete (mockWindow as { gtag?: (...args: unknown[]) => void }).gtag;
    trackGa4PurchaseOnce("cs_paid_2", payload);
    assert.equal(calls.length, 1);
  } finally {
    if (previous === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = previous;
  }
});

test("only paid live storefront sessions qualify as advertising conversions", () => {
  const base = {
    paid: true,
    livemode: true,
    delivery: "one_time",
    selectedProductIds: [1, 4, 10],
    amountTotalCents: 8900,
  };
  assert.equal(isMarketingEligibleCheckout(base), true);
  assert.equal(isMarketingEligibleCheckout({ ...base, paid: false }), false);
  assert.equal(isMarketingEligibleCheckout({ ...base, livemode: false }), false);
  assert.equal(isMarketingEligibleCheckout({ ...base, delivery: null }), false);
  assert.equal(isMarketingEligibleCheckout({ ...base, selectedProductIds: [] }), false);
  assert.equal(isMarketingEligibleCheckout({ ...base, amountTotalCents: 0 }), false);
});
