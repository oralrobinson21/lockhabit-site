import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const newsletterInput = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().min(1).max(80).default("homepage"),
  website: z.string().max(0).optional().default(""),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof newsletterInput>) => newsletterInput.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };

    const email = data.email.toLowerCase();
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email, source: data.source }, { onConflict: "email", ignoreDuplicates: true });

    if (error) {
      console.error("Newsletter signup failed", error.message);
      return { ok: false as const, error: "We couldn't save that email. Please try again." };
    }

    return { ok: true as const };
  });
