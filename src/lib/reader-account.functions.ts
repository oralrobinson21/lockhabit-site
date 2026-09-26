import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ensureReaderProfile = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; newsletterOptIn?: boolean }) =>
    z
      .object({
        accessToken: z.string().min(20).max(5000),
        newsletterOptIn: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: auth, error } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (error || !auth.user?.id || !auth.user.email) {
      return { ok: false as const };
    }

    // Never elevate: owners and creators are not given reader-only profiles here for desk access.
    const email = auth.user.email.toLowerCase();
    await supabaseAdmin.from("reader_profiles").upsert(
      {
        auth_user_id: auth.user.id,
        email,
        newsletter_opt_in: Boolean(data.newsletterOptIn),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" },
    );

    if (data.newsletterOptIn) {
      await supabaseAdmin.from("newsletter_subscribers").upsert(
        {
          email,
          source: "reader_signup",
          consent_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: "email" },
      );
    }

    return { ok: true as const };
  });
