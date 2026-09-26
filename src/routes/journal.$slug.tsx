import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Leaf } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { JournalReaderTools } from "@/components/journal-reader-tools";
import { IslandFooter } from "@/components/island-footer";
import { products } from "@/lib/catalog";
import { publishedJournalBlocks } from "@/lib/journal-content";
import { getPublishedJournalPost, getPublishedJournalPosts } from "@/lib/journal.functions";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const [post, journal] = await Promise.all([
      getPublishedJournalPost({ data: { slug: params.slug } }),
      getPublishedJournalPosts(),
    ]);
    if (!post) throw notFound();
    return { post, launched: journal.launched };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.post.seo_title || `${loaderData?.post.title ?? "Journal"} | LOCKHABIT` },
      { name: "description", content: loaderData?.post.seo_description || loaderData?.post.excerpt || "LOCKHABIT Journal" },
      { property: "og:type", content: "article" },
      { property: "og:title", content: loaderData?.post.seo_title || loaderData?.post.title || "LOCKHABIT Journal" },
      { property: "og:description", content: loaderData?.post.seo_description || loaderData?.post.excerpt || "LOCKHABIT Journal" },
      ...(loaderData?.post.hero_image_url ? [{ property: "og:image", content: loaderData.post.hero_image_url }] : []),
      ...(loaderData?.post.published_at ? [{ property: "article:published_time", content: loaderData.post.published_at }] : []),
      ...(!loaderData?.launched ? [{ name: "robots", content: "noindex,nofollow" }] : []),
    ],
    links: loaderData?.post ? [{ rel: "canonical", href: `https://lockhabit.com/journal/${loaderData.post.slug}` }] : [],
  }),
  component: JournalArticle,
});

function trackJournalLink(kind: "own_product" | "affiliate", slug: string) {
  const target = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({ event: kind === "affiliate" ? "journal_affiliate_click" : "journal_product_click", article_slug: slug });
}

function JournalArticle() {
  const { post, launched } = Route.useLoaderData();
  const blocks = publishedJournalBlocks(post.body);
  const references = Array.isArray(post.reference_items) ? post.reference_items.filter((item): item is string => typeof item === "string" && item.startsWith("https://")) : [];
  const recommendations = blocks.filter((block) => block.type === "own_product" || block.type === "affiliate");
  const prose = blocks.filter((block) => block.type === "heading" || block.type === "paragraph");
  const readerText = [post.title, post.excerpt, ...prose.map((block) => (block.type === "heading" || block.type === "paragraph" ? block.text : ""))].filter(Boolean).join(". ");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "LOCKHABIT Soap Co." },
    datePublished: post.published_at,
    dateModified: post.reviewed_at ?? post.published_at,
    mainEntityOfPage: `https://lockhabit.com/journal/${post.slug}`,
    ...(post.hero_image_url ? { image: post.hero_image_url } : {}),
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      {launched ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} /> : null}
      <article>
        <header className="border-b-2 border-foreground bg-[#f5e5bd] px-5 py-12 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <Link to="/journal" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4"><ArrowLeft size={16} /> Keep the Vibes Going</Link>
            <p className="memo mt-9 text-coral">{post.category} · {post.reading_time_minutes ?? 1} min read</p>
            <h1 className="mt-3 font-slab text-[clamp(3rem,7vw,6rem)] uppercase leading-[.92]">{post.title}</h1>
            <p className="mt-6 max-w-3xl font-display text-xl leading-relaxed">{post.excerpt}</p>
            <p className="mt-6 text-sm text-muted-foreground">By {post.author} · Published {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "recently"}{post.reviewed_at ? ` · Reviewed ${new Date(post.reviewed_at).toLocaleDateString("en-US")}` : ""}</p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-10 lg:px-10">
          {post.hero_image_url && post.hero_image_alt ? <img className="mb-10 aspect-[16/9] w-full rounded-2xl border-2 border-foreground object-cover" src={post.hero_image_url} alt={post.hero_image_alt} /> : null}
          <JournalReaderTools slug={post.slug} title={post.title} text={readerText} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div className="min-w-0">
              <div className="space-y-6 text-lg leading-8">
                {prose.map((block, index) => block.type === "heading"
                  ? <h2 key={index} className="scroll-mt-28 border-t border-foreground/20 pt-9 font-display text-3xl font-semibold leading-tight">{block.text}</h2>
                  : block.type === "paragraph" ? <p key={index} className="whitespace-pre-line">{block.text}</p> : null)}
              </div>

              {recommendations.length ? <section className="mt-14 border-t-2 border-foreground pt-9" aria-label="Helpful recommendations">
                <p className="memo text-coral">A little something for the journey</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">Things worth a closer look.</h2>
                <p className="mt-3 rounded-xl border-2 border-foreground bg-sun/30 p-4 text-sm leading-6"><strong>How this section works:</strong> LockHabit items are our own products. For outside products labeled “Paid link,” we may earn a commission if you buy through the link. Recommendations should be judged on their merits, not their payout.</p>
                <div className="mt-6 grid gap-4">
                  {recommendations.map((block, index) => {
                    if (block.type === "own_product") {
                      const product = products.find((item) => item.slug === block.slug);
                      if (!product) return null;
                      return <Link onClick={() => trackJournalLink("own_product", post.slug)} to="/soaps/$slug" params={{ slug: product.slug }} key={index} className="flex items-center gap-4 rounded-2xl border-2 border-foreground bg-paper p-4 transition hover:-translate-y-1">
                        <img src={product.images[0]?.src} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" /><span><span className="memo text-primary">LockHabit product · our own soap</span><strong className="mt-1 block font-display text-xl">{product.name}</strong><span className="mt-1 block text-sm">{block.note}</span></span><ArrowRight className="ml-auto shrink-0" size={18} />
                      </Link>;
                    }
                    return <div key={index} className="rounded-2xl border-2 border-foreground bg-secondary p-5"><p className="memo text-coral">Paid link · Outside recommendation</p><p className="mt-2 text-sm"><strong>We may earn a commission if you buy through this link.</strong></p><h3 className="mt-3 font-display text-2xl font-semibold">{block.label}</h3><p className="mt-2 text-sm">{block.note}</p><a onClick={() => trackJournalLink("affiliate", post.slug)} href={block.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">Visit outside site <ExternalLink size={16} /></a></div>;
                  })}
                </div>
              </section> : null}

              {references.length ? <section className="mt-14 border-t-2 border-foreground pt-9" aria-label="Article sources"><p className="memo text-primary">The receipts</p><h2 className="mt-2 font-display text-3xl font-semibold">Sources and further reading.</h2><ol className="mt-5 list-decimal space-y-3 pl-6 text-sm leading-6">{references.map((url, i) => <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline underline-offset-4">{url}</a></li>)}</ol></section> : null}
            </div>
            <aside className="lg:sticky lg:top-28 lg:self-start"><div className="rounded-2xl border-2 border-foreground bg-paper p-5"><Leaf className="text-primary" /><p className="memo mt-3 text-coral">Front desk note</p><p className="mt-2 font-display text-xl">Curiosity looks good on you.</p><p className="mt-3 text-sm text-muted-foreground">Read the sources. Check the details. Keep what works for your routine.</p></div></aside>
          </div>
        </div>
      </article>
      <IslandFooter />
    </main>
  );
}
