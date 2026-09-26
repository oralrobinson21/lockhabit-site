import assert from "node:assert/strict";
import test from "node:test";
import {
  formatReturnMoney,
  mergePhase,
  normalizeReturnItems,
  phaseForResult,
  shouldPollAgain,
} from "./checkout-return";

test("a lookup error keeps checking instead of claiming the payment failed", () => {
  assert.equal(phaseForResult({ paid: false, error: "timeout" }), "checking");
  assert.equal(shouldPollAgain({ paid: false, error: "timeout" }), true);
});

test("a late or failed response never downgrades a confirmed payment", () => {
  assert.equal(mergePhase("paid", "unpaid"), "paid");
  assert.equal(mergePhase("paid", "checking"), "paid");
  assert.equal(mergePhase("processing", "unpaid"), "processing");
  assert.equal(mergePhase("checking", "paid"), "paid");
});

test("keeps polling until the paid order is recorded", () => {
  assert.equal(shouldPollAgain({ paid: true, orderNumber: null }), true);
  assert.equal(shouldPollAgain({ paid: true, orderNumber: 21 }), false);
  assert.equal(shouldPollAgain({ paid: false }), false);
});

test("async payments show processing and keep polling", () => {
  assert.equal(phaseForResult({ paid: false, processing: true }), "processing");
  assert.equal(shouldPollAgain({ paid: false, processing: true }), true);
});

test("odd item shapes and currencies do not crash the page", () => {
  assert.deepEqual(normalizeReturnItems([{ productId: 4, quantity: "2" }, null]), [
    { name: "LockHabit item", quantity: 2, amountTotal: 0 },
  ]);
  assert.deepEqual(normalizeReturnItems("x"), []);
  assert.equal(formatReturnMoney(3945, "usd"), "$39.45");
  assert.equal(formatReturnMoney(3945, "not-a-currency"), "$39.45");
  assert.equal(formatReturnMoney(Number.NaN, "usd"), "$0.00");
});
