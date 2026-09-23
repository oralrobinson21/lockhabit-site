type MetaEventParams = Record<string, string | number | boolean | string[] | number[] | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Analytics must never block checkout in browsers with restricted storage or blocked pixels.
const sentEvents = new Set<string>();

export function trackMetaEvent(event: string, params?: MetaEventParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("track", event, params ?? {});
  } catch {
    // An optional advertising pixel must not affect cart or payment actions.
  }
}

export function trackMetaEventOnce(key: string, event: string, params?: MetaEventParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (sentEvents.has(key)) return;
  const storageKey = `lockhabit:meta:${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) {
      sentEvents.add(key);
      return;
    }
  } catch {
    // Private browsing may deny sessionStorage access; keep in-memory deduplication.
  }
  try {
    window.fbq("track", event, params ?? {});
  } catch {
    return;
  }
  sentEvents.add(key);
  try {
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Successful checkout is more important than optional pixel persistence.
  }
}
