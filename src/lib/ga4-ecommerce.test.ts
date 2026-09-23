import assert from "node:assert/strict";
import test from "node:test";

import {
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
