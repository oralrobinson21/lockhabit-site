import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublishedJournalPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("journal_posts")
    .select("slug,title,excerpt,category,author,published_at,hero_image_url,hero_image_alt,reading_time_minutes")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false }).limit(100);
  if (error) throw new Error("The Journal is temporarily unavailable.");
  const posts = data ?? [];
  return {
    posts,
    // Owner publication of three fully sourced articles opens the public Journal.
    // Fewer posts remain direct-route QA only and the landing stays noindexed.
    launched: posts.length >= 3,
  };
});

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
        "slug,title,excerpt,category,body,reference_items,published_at,hero_image_url,hero_image_alt,author,reviewed_at,reading_time_minutes,related_product_slugs,seo_title,seo_description",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error("Journal article could not be loaded.");
    return post;
  });
