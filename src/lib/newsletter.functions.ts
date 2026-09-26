import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const newsletterInput = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().min(1).max(80).default("homepage"),
  website: z.string().max(0).optional().default(""),
  /** Explicit marketing consent — required for new subscriptions. */
  consent: z.literal(true),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof newsletterInput>) => newsletterInput.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };

    const email = data.email.toLowerCase();
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email,
        source: data.source,
        consent_at: now,
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("Newsletter signup failed", error.message);
      return { ok: false as const, error: "We couldn't save that email. Please try again." };
    }

    return { ok: true as const };
  });

const unsubscribeInput = z.object({
  token: z.string().uuid(),
});

export const unsubscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof unsubscribeInput>) => unsubscribeInput.parse(data))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", data.token)
      .select("email")
      .maybeSingle();
    if (error) {
      console.error("Newsletter unsubscribe failed", error.message);
      return { ok: false as const, error: "Unsubscribe could not be completed." };
    }
    if (!row) return { ok: false as const, error: "That unsubscribe link is invalid or expired." };
    return { ok: true as const };
  });
