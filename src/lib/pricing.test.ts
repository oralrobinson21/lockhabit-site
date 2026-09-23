import assert from "node:assert/strict";
import test from "node:test";

import { assertOneTimeCheckout, getCartPricing } from "./pricing";

const soap = (quantity: number, id = 1) => ({
  id,
  kind: "Soap bar" as const,
  price: 35,
  quantity,
});
const shea = (quantity: number) => ({
  id: 11,
  kind: "Body care" as const,
  price: 42,
  quantity,
});

test("three-bar discount is active only at exactly three soap bars", () => {
  assert.deepEqual(
    [1, 2, 3, 4].map((quantity) => getCartPricing([soap(quantity)]).subtotal),
    [35, 70, 89, 140],
  );
  assert.equal(getCartPricing([soap(3)]).savings, 16);
  assert.equal(getCartPricing([soap(4)]).savings, 0);
});

test("six-bar discount is removed immediately when an item is removed", () => {
  const six = getCartPricing([soap(3), soap(3, 2)]);
  assert.equal(six.subtotal, 169);
  assert.equal(six.savings, 41);
  const five = getCartPricing([soap(2), soap(3, 2)]);
  assert.equal(five.subtotal, 175);
  assert.equal(five.savings, 0);
  const seven = getCartPricing([soap(4), soap(3, 2)]);
  assert.equal(seven.subtotal, 245);
  assert.equal(seven.savings, 0);
});

test("body care is priced separately and does not change soap bundle eligibility", () => {
  const order = getCartPricing([soap(3), shea(1)]);
  assert.equal(order.subtotal, 131);
  assert.equal(order.savings, 16);
  assert.equal(order.qualifiesForFreeShipping, true);
  assert.equal(getCartPricing([shea(1)]).subtotal, 42);
});

test("removed items never leave behind a subscription discount", () => {
  const first = getCartPricing([soap(1)]);
  const empty = getCartPricing([]);
  const replacement = getCartPricing([soap(1, 2)]);
  assert.equal(first.subtotal, 35);
  assert.equal(empty.subtotal, 0);
  assert.equal(replacement.subtotal, 35);
  assert.equal("canSubscribe" in replacement, false);
});

test("legacy recurring checkout requests are rejected before Stripe is called", () => {
  assert.throws(() => assertOneTimeCheckout(true), /Subscriptions are not available/);
  assert.doesNotThrow(() => assertOneTimeCheckout(false));
  assert.doesNotThrow(() => assertOneTimeCheckout(undefined));
});
