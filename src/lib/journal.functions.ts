import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublishedJournalPost = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) =>
    z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post, error } = await supabaseAdmin
      .from("journal_posts")
      .select(
        "slug,title,excerpt,category,body,reference_items,published_at,hero_image_url,hero_image_alt",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error("Journal article could not be loaded.");
    return post;
  });
