import assert from "node:assert/strict";
import test from "node:test";
import { applyQuantityChange } from "./cart-quantity";

test("rapid removals each count when applied to the latest state", () => {
  let cart: Record<number, number> = { 1: 3, 2: 1 };
  for (let i = 0; i < 3; i++) cart = applyQuantityChange(cart, 1, -1);
  assert.deepEqual(cart, { 2: 1 });
});

test("rapid additions each count and stop at 20", () => {
  let cart: Record<number, number> = { 1: 19 };
  cart = applyQuantityChange(cart, 1, 1);
  cart = applyQuantityChange(cart, 1, 1);
  assert.deepEqual(cart, { 1: 20 });
});

test("no-op changes keep the same object", () => {
  const cart = { 1: 1 };
  assert.equal(applyQuantityChange(cart, 2, -1), cart);
});
