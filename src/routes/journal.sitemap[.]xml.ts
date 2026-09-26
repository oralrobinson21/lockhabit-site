import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/journal/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("journal_posts")
          .select("slug,published_at")
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false }).limit(100);
        if (error) return new Response("Journal sitemap unavailable", { status: 503 });
        const posts = data ?? [];
        const urls = posts.length >= 3 ? [
          "<url><loc>https://lockhabit.com/journal</loc></url>",
          ...posts.filter((post) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug))
            .map((post) => `<url><loc>https://lockhabit.com/journal/${post.slug}</loc>${post.published_at ? `<lastmod>${post.published_at.slice(0, 10)}</lastmod>` : ""}</url>`),
        ] : [];
        return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
        });
      },
    },
  },
});
