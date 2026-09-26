import assert from "node:assert/strict";
import test from "node:test";

import {
  applyStackedDiscounts,
  commissionAvailableAt,
  commissionCents,
  parseOrderNumberCredential,
  shippingCentsForMerchandise,
} from "./checkout-discounts";

test("10% then 5% matches finish-line rounding examples", () => {
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 3500, applyCheckIn: true, applyReward: true })
      .afterRewardCents,
    2993,
  );
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 8900, applyCheckIn: true, applyReward: true })
      .afterRewardCents,
    7610,
  );
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 16900, applyCheckIn: true, applyReward: true })
      .afterRewardCents,
    14450,
  );
});

test("Check-In alone is 10% and reward alone is 5%", () => {
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 3500, applyCheckIn: true, applyReward: false })
      .afterRewardCents,
    3150,
  );
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 3500, applyCheckIn: false, applyReward: true })
      .afterRewardCents,
    3325,
  );
});

test("zero and negative merchandise never produce negative discounts", () => {
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: 0, applyCheckIn: true, applyReward: true })
      .afterRewardCents,
    0,
  );
  assert.equal(
    applyStackedDiscounts({ merchandiseCents: -100, applyCheckIn: true, applyReward: true })
      .afterRewardCents,
    0,
  );
});

test("commission is 10% of post-discount merchandise excluding shipping/tax", () => {
  assert.equal(commissionCents(7610), 761);
  assert.equal(commissionCents(2993), 299);
  assert.equal(commissionCents(0), 0);
});

test("14-day hold starts from paid_at", () => {
  const paid = new Date("2026-09-26T12:00:00.000Z");
  assert.equal(commissionAvailableAt(paid).toISOString(), "2026-10-10T12:00:00.000Z");
});

test("order credential parsing accepts LH- prefixes", () => {
  assert.equal(parseOrderNumberCredential("LH-000214"), 214);
  assert.equal(parseOrderNumberCredential("214"), 214);
  assert.equal(parseOrderNumberCredential("nope"), null);
});

test("free shipping uses post-discount merchandise", () => {
  assert.equal(shippingCentsForMerchandise(7499), 795);
  assert.equal(shippingCentsForMerchandise(7500), 0);
});
