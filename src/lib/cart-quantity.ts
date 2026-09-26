export const MAX_LINE_QUANTITY = 20;

/**
 * Applies a quantity change to the latest cart state. It must be used inside a
 * functional state update so rapid taps on + or − each count, instead of
 * several taps reading the same stale quantity and collapsing into one change.
 */
export function applyQuantityChange(
  cart: Record<number, number>,
  id: number,
  amount: number,
): Record<number, number> {
  const previous = cart[id] ?? 0;
  const next = Math.min(MAX_LINE_QUANTITY, Math.max(0, previous + amount));
  if (next === previous) return cart;
  const updated = { ...cart, [id]: next };
  if (next === 0) delete updated[id];
  return updated;
}
