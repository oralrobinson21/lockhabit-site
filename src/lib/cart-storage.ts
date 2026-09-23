export const CART_STORAGE_KEY = "lockhabit:cart:v2-onetime";

/** Only product ids and quantities are persisted. Prices and promotional flags are never trusted. */
export function parseStoredCart(raw: string | null): Record<number, number> {
  if (!raw || raw.length > 4096) return {};
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    const safe: Record<number, number> = {};
    for (const [key, value] of Object.entries(saved)) {
      const id = Number(key);
      if (!Number.isInteger(id) || id < 1 || id > 12 || String(id) !== key) continue;
      if (!Number.isInteger(value) || typeof value !== "number" || value < 1) continue;
      safe[id] = Math.min(value, 20);
    }
    return safe;
  } catch {
    return {};
  }
}

export function serializeCart(cart: Record<number, number>): string {
  return JSON.stringify(parseStoredCart(JSON.stringify(cart)));
}
