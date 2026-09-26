import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({ sessionToken: z.string().uuid() });

export const checkCheckInClaim = createServerFn({ method: "GET" })
  .validator((data: { sessionToken: string }) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: claim, error } = await supabaseAdmin
      .from("checkin_offer_claims")
      .select("claimed_at")
      .eq("session_token", data.sessionToken)
      .maybeSingle();
    if (error) throw new Error("Check-In offer is temporarily unavailable.");
    return { claimed: Boolean(claim) };
  });

export const claimCheckInOffer = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string }) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("checkin_offer_claims")
      .upsert(
        { session_token: data.sessionToken, last_seen_at: new Date().toISOString() },
        { onConflict: "session_token" },
      );
    if (error) throw new Error("Check-In offer could not be saved. Please try again.");
    return { claimed: true as const };
  });
