/** Server-side LockHabit discount stacking. Never trust client totals. */

export const CHECKIN_DISCOUNT_FRACTION = 0.9;
export const REWARD_DISCOUNT_FRACTION = 0.95;
export const COMMISSION_HOLD_DAYS = 14;
export const DEFAULT_COMMISSION_BPS = 1000;

export type StackedDiscountInput = {
  merchandiseCents: number;
  applyCheckIn: boolean;
  applyReward: boolean;
};

export type StackedDiscountResult = {
  merchandiseCents: number;
  afterCheckInCents: number;
  afterRewardCents: number;
  checkInDiscountCents: number;
  rewardDiscountCents: number;
  totalDiscountCents: number;
  labels: string[];
};

/** Sequential 10% then 5% with integer-cent rounding (half-up via Math.round). */
export function applyStackedDiscounts(input: StackedDiscountInput): StackedDiscountResult {
  const merchandiseCents = Math.max(0, Math.trunc(input.merchandiseCents));
  const afterCheckInCents = input.applyCheckIn
    ? Math.round(merchandiseCents * CHECKIN_DISCOUNT_FRACTION)
    : merchandiseCents;
  const afterRewardCents = input.applyReward
    ? Math.round(afterCheckInCents * REWARD_DISCOUNT_FRACTION)
    : afterCheckInCents;
  const checkInDiscountCents = merchandiseCents - afterCheckInCents;
  const rewardDiscountCents = afterCheckInCents - afterRewardCents;
  const labels: string[] = [];
  if (checkInDiscountCents > 0) labels.push("Check-In 10%");
  if (rewardDiscountCents > 0) labels.push("Returning 5%");
  return {
    merchandiseCents,
    afterCheckInCents,
    afterRewardCents,
    checkInDiscountCents,
    rewardDiscountCents,
    totalDiscountCents: checkInDiscountCents + rewardDiscountCents,
    labels,
  };
}

export function commissionCents(paidMerchandiseCents: number, bps = DEFAULT_COMMISSION_BPS): number {
  const base = Math.max(0, Math.trunc(paidMerchandiseCents));
  const rate = Math.max(0, Math.trunc(bps));
  return Math.floor((base * rate) / 10000);
}

export function commissionAvailableAt(paidAt: Date, holdDays = COMMISSION_HOLD_DAYS): Date {
  const available = new Date(paidAt.getTime());
  available.setUTCDate(available.getUTCDate() + holdDays);
  return available;
}

/** Accept LH-000214, #214, or bare digits. */
export function parseOrderNumberCredential(raw: string): number | null {
  const digits = raw.trim().toUpperCase().replace(/^LH-?/, "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  if (!Number.isSafeInteger(value) || value < 1) return null;
  return value;
}

export function shippingCentsForMerchandise(merchandiseCents: number): number {
  return merchandiseCents >= 7500 ? 0 : 795;
}
