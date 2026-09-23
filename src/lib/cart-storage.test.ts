import assert from "node:assert/strict";
import test from "node:test";

import { parseStoredCart, serializeCart } from "./cart-storage";
import { getCartPricing } from "./pricing";

test("cart survives reload with only validated product quantities", () => {
  assert.deepEqual(parseStoredCart('{"1":3,"12":1,"subscribe":true,"discount":0.15,"99":4}'), { 1: 3, 12: 1 });
  assert.deepEqual(parseStoredCart(serializeCart({ 1: 6, 11: 1 })), { 1: 6, 11: 1 });
});
test("malformed and malicious local storage does not affect checkout", () => {
  for (const value of [null, "", "{", "[]", '"hello"', '{"__proto__":{"subscribe":true}}']) {
    assert.deepEqual(parseStoredCart(value), {});
  }
  assert.deepEqual(parseStoredCart('{"1":999999,"2":-1,"3":1.3}'), { 1: 20 });
});
test("legacy 15-percent discount flag never carries into fresh cart pricing", () => {
  const cart = parseStoredCart('{"1":1,"subscribe":true,"discount":0.15}');
  const subtotal = getCartPricing([{ id: 1, kind: "Soap bar", price: 35, quantity: cart[1]! }]).subtotal;
  assert.equal(subtotal, 35);
});
