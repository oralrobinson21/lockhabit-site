type MetaEventParams = Record<string, string | number | boolean | string[] | number[] | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(event: string, params?: MetaEventParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params ?? {});
}

export function trackMetaEventOnce(key: string, event: string, params?: MetaEventParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  const storageKey = `lockhabit:meta:${key}`;
  if (window.sessionStorage.getItem(storageKey)) return;
  window.sessionStorage.setItem(storageKey, "1");
  window.fbq("track", event, params ?? {});
}
