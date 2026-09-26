import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { IslandFooter } from "@/components/island-footer";
import { getPublishedJournalPost } from "@/lib/journal.functions";

export const Route = createFileRoute("/journal/$slug")({
  head: () => ({
    meta: [
      { title: "Keep the Vibes Going · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: async ({ params }) => {
    const post = await getPublishedJournalPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  component: JournalArticle,
});

function JournalArticle() {
  const post = Route.useLoaderData();
  const paragraphs = Array.isArray(post.body) ? post.body : [];
  const references = Array.isArray(post.reference_items) ? post.reference_items : [];
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
        <Link to="/journal" className="font-bold underline">
          ← Keep the Vibes Going
        </Link>
        <p className="eyebrow mt-9">{post.category}</p>
        <h1 className="section-title mt-3">{post.title}</h1>
        <p className="mt-5 text-lg">{post.excerpt}</p>
        {post.hero_image_url && post.hero_image_alt ? (
          <img
            className="mt-8 w-full rounded-2xl"
            src={post.hero_image_url}
            alt={post.hero_image_alt}
          />
        ) : null}
        <div className="mt-9 space-y-5 leading-8">
          {paragraphs.map((item, index) => {
            const text =
              item &&
              typeof item === "object" &&
              !Array.isArray(item) &&
              typeof item["text"] === "string"
                ? item["text"]
                : "";
            return text ? <p key={index}>{text}</p> : null;
          })}
        </div>
        {references.length ? (
          <section className="mt-10 border-t pt-7">
            <h2 className="font-display text-2xl">References</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {references.map((item, i) =>
                typeof item === "string" ? <li key={i}>{item}</li> : null,
              )}
            </ul>
          </section>
        ) : null}
      </article>
      <IslandFooter />
    </main>
  );
}
