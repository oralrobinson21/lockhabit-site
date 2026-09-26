/** Finish-line GA4 growth events. Non-PII only; never block checkout. */

type Ga4Params = Record<string, string | number | boolean>;

function trackGa4Event(event: string, params: Ga4Params = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  try {
    gtag("event", event, params);
  } catch {
    // Analytics must never interrupt checkout.
  }
  try {
    const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    // dataLayer push is best-effort.
  }
}

export function trackReturnRewardApplied() {
  trackGa4Event("return_reward_applied", { discount_percent: 5 });
}

export function trackAffiliateCheckout(input: { source: "code" | "token"; livemode: boolean }) {
  trackGa4Event("affiliate_checkout", {
    attribution_source: input.source,
    stripe_livemode: input.livemode,
  });
}

export function trackAffiliatePurchase(input: {
  livemode: boolean;
  valueCents: number;
  currency: string;
}) {
  trackGa4Event("affiliate_purchase", {
    stripe_livemode: input.livemode,
    value: Number((Math.max(0, input.valueCents) / 100).toFixed(2)),
    currency: input.currency.toUpperCase(),
  });
}
