type CheckoutItem = {
  productId?: number;
  name: string;
  quantity: number;
  amountTotal: number;
};

type PurchaseInput = {
  transactionId: string;
  totalCents: number;
  shippingCents: number;
  taxCents: number;
  currency: string;
  items: CheckoutItem[];
};

/** GA4 purchase value excludes shipping and tax; Stripe's paid session is the source of truth. */
export function buildGa4PurchasePayload({
  transactionId,
  totalCents,
  shippingCents,
  taxCents,
  currency,
  items,
}: PurchaseInput) {
  const dollars = (cents: number) => Number((Math.max(0, cents) / 100).toFixed(2));
  return {
    transaction_id: transactionId,
    currency: currency.toUpperCase(),
    value: dollars(Math.max(0, totalCents - shippingCents - taxCents)),
    shipping: dollars(shippingCents),
    tax: dollars(taxCents),
    items: items.map((item) => ({
      ...(item.productId !== undefined ? { item_id: String(item.productId) } : {}),
      item_name: item.name,
      quantity: item.quantity,
      price: dollars(item.amountTotal / Math.max(1, item.quantity)),
    })),
  };
}

// Covers browsers that block localStorage: one event per checkout in this page lifetime.
const sentCheckoutSessions = new Set<string>();

/** Record at most one browser purchase event per paid, live Stripe checkout session. */
export function trackGa4PurchaseOnce(
  sessionId: string,
  payload: ReturnType<typeof buildGa4PurchasePayload>,
) {
  if (typeof window === "undefined") return;
  if (sentCheckoutSessions.has(sessionId)) return;
  const storageKey = `lockhabit:ga4-live-purchase:${sessionId}`;
  try {
    if (window.localStorage.getItem(storageKey)) {
      sentCheckoutSessions.add(sessionId);
      return;
    }
  } catch {
    // Browsers blocking storage still get in-memory deduplication.
  }

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  try {
    gtag("event", "purchase", payload);
  } catch {
    // Analytics errors must never interrupt paid order confirmation.
    return;
  }
  sentCheckoutSessions.add(sessionId);

  try {
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // The event has been queued; storage failure is non-fatal.
  }
}
