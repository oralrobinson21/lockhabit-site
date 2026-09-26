import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const password = z.string().min(12).max(128);

export const getCreatorDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error: profileError } = await context.supabase.rpc(
      "creator_profile_for_current_user",
    );
    if (profileError) throw new Error("Creator profile could not be loaded.");
    const creator = profile?.[0];
    if (!creator || !["approved", "active"].includes(creator.status)) {
      throw new Error("This account does not have creator access.");
    }
    const [
      { data: summary, error: summaryError },
      { data: sales, error: salesError },
      { data: transactions, error: txError },
      { data: payouts, error: payoutError },
    ] = await Promise.all([
      context.supabase.rpc("creator_dashboard_summary"),
      context.supabase
        .from("creator_attributions")
        .select("id,order_number,paid_merchandise_cents,currency,paid_at")
        .eq("creator_id", creator.id)
        .order("paid_at", { ascending: false })
        .limit(100),
      context.supabase
        .from("creator_commission_ledger")
        .select("id,entry_type,amount_cents,currency,status,available_at,created_at,attribution_id")
        .eq("creator_id", creator.id)
        .order("created_at", { ascending: false })
        .limit(100),
      context.supabase
        .from("creator_payout_requests")
        .select("id,amount_cents,currency,status,requested_at,reviewed_at,paid_at")
        .eq("creator_id", creator.id)
        .order("requested_at", { ascending: false })
        .limit(50),
    ]);
    if (summaryError || salesError || txError || payoutError)
      throw new Error("Creator dashboard could not be loaded.");
    return {
      profile: creator,
      summary: summary?.[0] ?? null,
      sales: sales ?? [],
      transactions: transactions ?? [],
      payouts: payouts ?? [],
    };
  });

export const requestCreatorPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { amountCents: number }) =>
    z.object({ amountCents: z.number().int().min(2000).max(100_000_000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: requestId, error } = await context.supabase.rpc("request_creator_payout", {
      p_amount_cents: data.amountCents,
    });
    if (error) throw new Error(error.message || "Payout request could not be created.");
    return { ok: true as const, requestId };
  });

export const acceptCreatorProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("creator_profiles")
      .update({
        agreement_accepted_at: now,
        disclosure_acknowledged_at: now,
        agreement_version: "2026-09-26",
      })
      .eq("auth_user_id", context.userId)
      .in("status", ["approved", "active"])
      .select("id")
      .maybeSingle();
    if (error || !data) throw new Error("Creator acknowledgement could not be saved.");
    return { ok: true as const };
  });

export const changeCreatorPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { password: string }) => z.object({ password }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.auth.updateUser({ password: data.password });
    if (error) throw new Error("Password could not be updated.");
    return { ok: true as const };
  });

export const requestCreatorPasswordReset = createServerFn({ method: "POST" })
  .validator((data: { email: string }) =>
    z
      .object({
        email: z.string().email().max(320),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    const { data: profile } = await supabaseAdmin
      .from("creator_profiles")
      .select("id,email,status")
      .eq("email", email)
      .in("status", ["approved", "active"])
      .maybeSingle();
    if (!profile) return { ok: true as const };
    const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: claimed } = await supabaseAdmin
      .from("creator_profiles")
      .update({ reset_requested_at: new Date().toISOString() })
      .eq("id", profile.id)
      .or(`reset_requested_at.is.null,reset_requested_at.lt.${cutoff}`)
      .select("id")
      .maybeSingle();
    if (!claimed) return { ok: true as const };
    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: "https://lockhabit.com/creator/set-password" },
    });
    const actionLink = linkData?.properties?.action_link;
    if (error || !actionLink) return { ok: true as const };
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    if (apiKey && from) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Reset your LOCKHABIT creator password",
          text: `Use this secure link to choose a new creator password:\n\n${actionLink}\n\nIf you did not request this, ignore this email.`,
          html: `<p>Use this secure link to choose a new creator password:</p><p><a href="${actionLink}">Reset creator password</a></p><p>If you did not request this, ignore this email.</p>`,
        }),
      });
    }
    return { ok: true as const };
  });
