import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const password = z.string().min(12).max(128);

export const getCreatorDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error: profileError } = await (context.supabase as any)
      .rpc("creator_profile_for_current_user");
    if (profileError) throw new Error("Creator profile could not be loaded.");
    const creator = profile?.[0];
    if (!creator || !["approved", "active"].includes(creator.status)) {
      throw new Error("This account does not have creator access.");
    }
    const [{ data: summary, error: summaryError }, { data: transactions, error: txError }, { data: payouts, error: payoutError }] =
      await Promise.all([
        (context.supabase as any).rpc("creator_dashboard_summary"),
        (context.supabase as any).from("creator_commission_ledger")
          .select("id,entry_type,amount_cents,currency,status,available_at,created_at,attribution_id")
          .order("created_at", { ascending: false }).limit(100),
        (context.supabase as any).from("creator_payout_requests")
          .select("id,amount_cents,currency,status,requested_at,reviewed_at,paid_at")
          .order("requested_at", { ascending: false }).limit(50),
      ]);
    if (summaryError || txError || payoutError) throw new Error("Creator dashboard could not be loaded.");
    return { profile: creator, summary: summary?.[0] ?? null, transactions: transactions ?? [], payouts: payouts ?? [] };
  });

export const requestCreatorPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { amountCents: number }) =>
    z.object({ amountCents: z.number().int().min(2000).max(100_000_000) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: requestId, error } = await (context.supabase as any).rpc("request_creator_payout", {
      p_amount_cents: data.amountCents,
    });
    if (error) throw new Error(error.message || "Payout request could not be created.");
    return { ok: true as const, requestId };
  });

export const changeCreatorPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { password: string }) => z.object({ password }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).auth.updateUser({ password: data.password });
    if (error) throw new Error("Password could not be updated.");
    return { ok: true as const };
  });
