import { getCartPricing, type CartLine } from "@/lib/pricing";

export type Ga4EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  discount?: number;
};

export type Ga4CheckoutLine = CartLine & { name: string };
type Ga4Params = Record<string, string | number | Ga4EcommerceItem[]>;

const dollars = (amount: number) =>
  Number((Number.isFinite(amount) ? Math.max(0, amount) : 0).toFixed(2));

export function ga4Item(
  id: number | string,
  name: string,
  price: number,
  quantity: number,
): Ga4EcommerceItem {
  return {
    item_id: String(id),
    item_name: name,
    // GA4 item price is the actual paid unit price, retaining sub-cent precision
    // for 3/6-bar bundles (e.g. $89 / 3) so item totals match event value.
    price: Number(Math.max(0, price).toFixed(4)),
    quantity: Math.max(1, Math.floor(quantity)),
  };
}

function trackGa4Event(event: string, params: Ga4Params) {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  try {
    gtag("event", event, params);
  } catch {
    // Analytics must never interrupt the customer's cart or payment journey.
  }
}

export function trackViewItem(id: number | string, name: string, price: number) {
  trackGa4Event("view_item", {
    currency: "USD",
    value: dollars(price),
    items: [ga4Item(id, name, price, 1)],
  });
}

/** Shared guard: do not advertise cart units rejected by the 20-unit limit. */
export function acceptedCartQuantity(existing: number, requested: number): number {
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  return Math.min(Math.floor(requested), Math.max(0, 20 - existing));
}

/** Only call after the cart accepts the specified number of units. */
export function trackAddToCart(items: Ga4EcommerceItem[]) {
  if (!items.length) return;
  trackGa4Event("add_to_cart", {
    currency: "USD",
    value: dollars(items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    items,
  });
}

/**
 * Checkout value reflects the actual cart price, including 3/6-bar pricing.
 * Stripe promotion codes entered later are represented by the paid purchase,
 * not guessed from the pre-Stripe checkout event.
 */
export function buildGa4CheckoutPayload(lines: Ga4CheckoutLine[]) {
  const { subtotal, soapCount, savings } = getCartPricing(lines);
  const discountPerSoap = soapCount > 0 ? Number((savings / soapCount).toFixed(4)) : 0;

  return {
    currency: "USD",
    value: dollars(subtotal),
    items: lines
      .filter((line) => line.quantity > 0)
      .map((line) => {
        const isDiscountedSoap = line.kind === "Soap bar" && discountPerSoap > 0;
        // Google does NOT deduct item.discount from item.price; report the
        // discounted price itself and the unit discount separately.
        const unitPrice = isDiscountedSoap ? line.price - discountPerSoap : line.price;
        return {
          ...ga4Item(line.id, line.name, unitPrice, line.quantity),
          ...(isDiscountedSoap ? { discount: discountPerSoap } : {}),
        };
      }),
  };
}

/**
 * Price only the units actually added, using the cart's new bundle tier.
 * GA4 item price is the discounted unit price; the event value is their sum.
 */
export function buildGa4AddedCartItems(
  projectedCart: Ga4CheckoutLine[],
  additions: Array<{ id: number; quantity: number }>,
): Ga4EcommerceItem[] {
  const itemPrices = new Map(
    buildGa4CheckoutPayload(projectedCart).items.map((item) => [item.item_id, item]),
  );
  return additions.flatMap(({ id, quantity }) => {
    const item = itemPrices.get(String(id));
    return item && quantity > 0 ? [{ ...item, quantity: Math.floor(quantity) }] : [];
  });
}

/** Call only after Stripe has created a real Checkout Session. */
export function trackBeginCheckout(lines: Ga4CheckoutLine[]) {
  if (!lines.length) return;
  trackGa4Event("begin_checkout", {
    ...buildGa4CheckoutPayload(lines),
    transport_type: "beacon",
  });
}
