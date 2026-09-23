import assert from "node:assert/strict";
import test from "node:test";

import {
  acceptedCartQuantity,
  buildGa4AddedCartItems,
  buildGa4CheckoutPayload,
  ga4Item,
  trackAddToCart,
  trackBeginCheckout,
  trackViewItem,
} from "./ga4-ecommerce";

function withGtag(run: (calls: unknown[][]) => void) {
  const calls: unknown[][] = [];
  const globalWithWindow = globalThis as unknown as { window?: unknown };
  const previous = globalWithWindow.window;
  globalWithWindow.window = { gtag: (...args: unknown[]) => calls.push(args) };
  try {
    run(calls);
  } finally {
    if (previous === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = previous;
  }
}

const soap = (id: number, name: string, quantity = 1) => ({
  id,
  name,
  kind: "Soap bar" as const,
  price: 35,
  quantity,
});

test("view_item uses real catalog IDs, product names, and prices", () => {
  withGtag((calls) => {
    trackViewItem(1, "Coconut Beach Soap", 35);
    assert.deepEqual(calls, [
      ["event", "view_item", {
        currency: "USD",
        value: 35,
        items: [{ item_id: "1", item_name: "Coconut Beach Soap", price: 35, quantity: 1 }],
      }],
    ]);
  });
});

test("add_to_cart emits the accepted quantity and no empty event", () => {
  withGtag((calls) => {
    trackAddToCart([]);
    trackAddToCart([ga4Item(4, "Slumber Soap", 35, 2)]);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], [
      "event",
      "add_to_cart",
      { currency: "USD", value: 70, items: [ga4Item(4, "Slumber Soap", 35, 2)] },
    ]);
  });
});

test("begin_checkout uses the real $89 three-bar price and distributes the discount", () => {
  const payload = buildGa4CheckoutPayload([
    soap(1, "Coconut Beach Soap"),
    soap(4, "Slumber Soap"),
    soap(10, "Charcoal Soap"),
  ]);
  assert.equal(payload.value, 89);
  assert.deepEqual(payload.items.map((item) => item.item_id), ["1", "4", "10"]);
  assert.deepEqual(payload.items.map((item) => item.discount), [5.3333, 5.3333, 5.3333]);
  assert.deepEqual(payload.items.map((item) => item.price), [29.6667, 29.6667, 29.6667]);
  assert.ok(Math.abs(payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - 89) < 0.01);
  withGtag((calls) => {
    trackBeginCheckout([soap(1, "Coconut Beach Soap", 3)]);
    assert.equal(calls[0]?.[1], "begin_checkout");
    assert.equal((calls[0]?.[2] as { value: number }).value, 89);
  });
});

test("six soap bars with shea report $211, not six list prices", () => {
  const payload = buildGa4CheckoutPayload([
    soap(1, "Coconut Beach Soap", 3),
    soap(4, "Slumber Soap", 3),
    { id: 11, name: "Raw Shea Butter", kind: "Body care", price: 42, quantity: 1 },
  ]);
  assert.equal(payload.value, 211);
  assert.equal(payload.items[0]?.discount, 6.8333);
  assert.equal(payload.items[1]?.discount, 6.8333);
  assert.equal(payload.items[2]?.discount, undefined);
  assert.equal(payload.items[0]?.price, 28.1667);
  assert.equal(payload.items[1]?.price, 28.1667);
  assert.equal(payload.items[2]?.price, 42);
  assert.ok(Math.abs(payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - 211) < 0.01);
});

test("ecommerce tracking tolerates SSR and a missing Google tag", () => {
  const globalWithWindow = globalThis as unknown as { window?: unknown };
  const previous = globalWithWindow.window;
  delete globalWithWindow.window;
  try {
    trackViewItem(1, "Coconut Beach Soap", 35);
    trackAddToCart([ga4Item(1, "Coconut Beach Soap", 35, 1)]);
    trackBeginCheckout([soap(1, "Coconut Beach Soap")]);
    globalWithWindow.window = {};
    trackViewItem(1, "Coconut Beach Soap", 35);
  } finally {
    if (previous === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = previous;
  }
});

test("cart measurement ignores rejected units at cap", () => {
  assert.equal(acceptedCartQuantity(20, 1), 0);
  assert.equal(acceptedCartQuantity(19, 3), 1);
  assert.equal(acceptedCartQuantity(2, 3), 3);
  assert.equal(acceptedCartQuantity(0, 0), 0);
});

test("GA4 add_to_cart uses discounted prices when adding the $89 three-bar bundle", () => {
  const projected = [
    soap(1, "Coconut Beach Soap"),
    soap(4, "Slumber Soap"),
    soap(10, "Charcoal Soap"),
  ];
  const additions = projected.map(({ id }) => ({ id, quantity: 1 }));
  const items = buildGa4AddedCartItems(projected, additions);
  assert.deepEqual(items.map((item) => item.price), [29.6667, 29.6667, 29.6667]);
  withGtag((calls) => {
    trackAddToCart(items);
    assert.equal((calls[0]?.[2] as { value: number }).value, 89);
  });
});

test("GA4 cart additions report only new units using the resulting bundle price", () => {
  const projected = [
    soap(1, "Coconut Beach Soap", 2),
    soap(4, "Slumber Soap"),
    { id: 11, name: "Raw Shea Butter", kind: "Body care" as const, price: 42, quantity: 1 },
  ];
  const items = buildGa4AddedCartItems(projected, [{ id: 4, quantity: 1 }, { id: 11, quantity: 1 }]);
  assert.deepEqual(items.map((item) => item.item_id), ["4", "11"]);
  assert.deepEqual(items.map((item) => item.quantity), [1, 1]);
  assert.deepEqual(items.map((item) => item.price), [29.6667, 42]);
  assert.deepEqual(buildGa4AddedCartItems(projected, [{ id: 10, quantity: 1 }]), []);
});
