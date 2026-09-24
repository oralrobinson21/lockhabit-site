import type { Product } from "@/lib/catalog";

export const SINGLE_BAR_PRICE = 35;
export const SHEA_BUTTER_PRICE = 42;
export const THREE_BAR_BUNDLE_PRICE = 89;
export const SIX_BAR_BUNDLE_PRICE = 169;
export const FREE_SHIPPING_THRESHOLD = 75;

/** Reject obsolete subscription checkouts before any payment provider call. */
export function assertOneTimeCheckout(subscribe?: boolean) {
  if (subscribe === true) {
    throw new Error("Subscriptions are not available. Please place a one-time order.");
  }
}

export type CartLine = Pick<Product, "id" | "kind" | "price"> & { quantity: number };

export function amountUntilFreeShipping(subtotal: number) {
  if (!Number.isFinite(subtotal)) return FREE_SHIPPING_THRESHOLD;
  return Number(Math.max(0, FREE_SHIPPING_THRESHOLD - Math.max(0, subtotal)).toFixed(2));
}

export function getCartPricing(lines: CartLine[]) {
  const soapCount = lines.reduce(
    (sum, line) => sum + (line.kind === "Soap bar" ? line.quantity : 0),
    0,
  );
  const bodyCareTotal = lines.reduce(
    (sum, line) => sum + (line.kind === "Body care" ? line.price * line.quantity : 0),
    0,
  );
  const regularSoapTotal = soapCount * SINGLE_BAR_PRICE;
  const soapTotal =
    soapCount === 3
      ? THREE_BAR_BUNDLE_PRICE
      : soapCount === 6
        ? SIX_BAR_BUNDLE_PRICE
        : regularSoapTotal;
  const subtotal = soapTotal + bodyCareTotal;

  return {
    soapCount,
    subtotal,
    savings: regularSoapTotal - soapTotal,
    qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}
