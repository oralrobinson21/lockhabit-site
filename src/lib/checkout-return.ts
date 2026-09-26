export type CheckoutStatusResult = {
  paid: boolean;
  processing?: boolean;
  error?: string;
  orderNumber?: number | null;
};

export type ReturnPhase = "checking" | "paid" | "processing" | "unpaid" | "delayed";

export const RETURN_POLL_DELAYS_MS = [1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000];

/** What the confirmation page should show for one status response. */
export function phaseForResult(result: CheckoutStatusResult): ReturnPhase {
  if (result.paid) return "paid";
  if (result.processing) return "processing";
  if (result.error) return "checking";
  return "unpaid";
}

/**
 * A later response must never undo a confirmed payment, so a slow or failed
 * lookup that finishes after a "paid" answer cannot blank or downgrade the page.
 */
export function mergePhase(current: ReturnPhase, incoming: ReturnPhase): ReturnPhase {
  if (current === "paid") return "paid";
  if (current === "processing" && (incoming === "unpaid" || incoming === "checking"))
    return current;
  return incoming;
}

/** Whether to ask again: a failed lookup, a pending async payment, or a paid order the webhook hasn't recorded yet. */
export function shouldPollAgain(result: CheckoutStatusResult | null): boolean {
  if (!result) return true;
  if (result.error) return true;
  if (result.processing) return true;
  if (result.paid && !result.orderNumber) return true;
  return false;
}

export type ReturnItem = { name: string; quantity: number; amountTotal: number };

/** Keeps the page rendering even if stored order items have an unexpected shape. */
export function normalizeReturnItems(raw: unknown): ReturnItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const e = entry as Record<string, unknown>;
    const name = typeof e["name"] === "string" && e["name"] ? e["name"] : "LockHabit item";
    const quantity = Number.isFinite(Number(e["quantity"])) ? Number(e["quantity"]) : 1;
    const amountTotal = Number.isFinite(Number(e["amountTotal"])) ? Number(e["amountTotal"]) : 0;
    return [{ name, quantity, amountTotal }];
  });
}

export function formatReturnMoney(cents: number, currency: string): string {
  const value = Number.isFinite(cents) ? cents / 100 : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}
