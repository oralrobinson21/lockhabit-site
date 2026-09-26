export const CHECKIN_STORAGE_KEY = "lockhabit_checkin_offer_v1";
export const CHECKIN_SESSION_KEY = "lockhabit_checkin_session_v1";
export const CREATOR_ATTRIBUTION_KEY = "lockhabit_creator_attribution";
export const PRIOR_ORDER_REWARD_KEY = "lockhabit_prior_order_reward_v1";

export function isCheckInOfferSaved(value: string | null): boolean {
  if (!value) return false;
  try {
    return (JSON.parse(value) as { state?: unknown }).state === "applied";
  } catch {
    return false;
  }
}

export function readCheckInSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CHECKIN_SESSION_KEY);
    return value && /^[a-f0-9-]{36}$/i.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function readCreatorAttributionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CREATOR_ATTRIBUTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: string };
    if (!parsed.token || !/^[a-f0-9-]{36}$/i.test(parsed.token)) return null;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) return null;
    return parsed.token;
  } catch {
    return null;
  }
}
