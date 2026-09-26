import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedCreatorAttribution = {
  creatorId: string;
  attributionToken: string | null;
  referralCode: string | null;
  commissionBps: number;
  source: "code" | "token";
};

type CreatorRow = {
  id: string;
  referral_code: string;
  commission_bps: number;
  status: string;
};

/**
 * Typed creator code overrides link/cookie attribution when the code is valid
 * for an active creator. Otherwise the unexpired click token wins.
 */
export async function resolveCreatorAttribution(
  supabase: SupabaseClient,
  input: { creatorCode?: string | null; attributionToken?: string | null },
): Promise<ResolvedCreatorAttribution | null> {
  const code = input.creatorCode?.trim().toUpperCase() ?? "";
  if (code) {
    const { data: byCode, error } = await supabase
      .from("creator_profiles")
      .select("id, referral_code, commission_bps, status")
      .eq("referral_code", code)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error("Creator code could not be verified.");
    if (byCode) {
      const row = byCode as CreatorRow;
      return {
        creatorId: row.id,
        attributionToken: null,
        referralCode: row.referral_code,
        commissionBps: row.commission_bps,
        source: "code",
      };
    }
  }

  const token = input.attributionToken?.trim() ?? "";
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return null;

  const { data: click, error: clickError } = await supabase
    .from("creator_referral_clicks")
    .select("attribution_token, creator_id, expires_at")
    .eq("attribution_token", token)
    .maybeSingle();
  if (clickError) throw new Error("Referral could not be verified.");
  if (!click) return null;
  if (new Date(String(click.expires_at)).getTime() < Date.now()) return null;

  const { data: profile, error: profileError } = await supabase
    .from("creator_profiles")
    .select("id, referral_code, commission_bps, status")
    .eq("id", click.creator_id)
    .eq("status", "active")
    .maybeSingle();
  if (profileError) throw new Error("Referral creator could not be verified.");
  if (!profile) return null;
  const row = profile as CreatorRow;
  return {
    creatorId: row.id,
    attributionToken: String(click.attribution_token),
    referralCode: row.referral_code,
    commissionBps: row.commission_bps,
    source: "token",
  };
}
