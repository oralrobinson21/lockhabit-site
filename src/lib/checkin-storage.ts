export const CHECKIN_STORAGE_KEY = "lockhabit_checkin_offer_v1";

export function isCheckInOfferSaved(value: string | null): boolean {
  if (!value) return false;
  try {
    return (JSON.parse(value) as { state?: unknown }).state === "applied";
  } catch {
    return false;
  }
}
