import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedJournalPosts } from "@/lib/journal.functions";
import { JournalComingSoon } from "@/routes/journal.coming-soon";

export const Route = createFileRoute("/journal/")({
  loader: () => getPublishedJournalPosts(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Keep the Vibes Going · LOCKHABIT Journal" },
      { name: "description", content: "Ingredient stories, everyday rituals and brighter travels from LOCKHABIT." },
      ...(!loaderData?.launched ? [{ name: "robots", content: "noindex,nofollow" }] : []),
    ],
    links: [{ rel: "canonical", href: "https://lockhabit.com/journal" }],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  const { launched, posts } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All stories");
  const categories = useMemo(() => ["All stories", ...new Set(posts.map((post) => post.category))], [posts]);
  const visible = posts.filter((post) =>
    (category === "All stories" || post.category === category) &&
    `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  if (!launched) return <JournalComingSoon />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <header className="relative overflow-hidden border-b-2 border-foreground bg-[#f5e5bd] px-5 py-16 lg:px-10 lg:py-24">
        <div className="relative mx-auto max-w-7xl">
          <p className="memo text-coral">The LOCKHABIT Journal · Keep the Vibes Going</p>
          <h1 className="mt-5 max-w-5xl font-slab text-[clamp(3.7rem,10vw,8.5rem)] uppercase leading-[.85]">
            <span className="text-coral">Good stories.</span><br /><span className="text-[#173c2d]">Brighter days.</span>
          </h1>
          <p className="mt-7 max-w-2xl font-display text-xl leading-relaxed">Ingredient stories, rituals worth keeping, and interesting detours. Honest sources, bright ideas, no miracle promises.</p>
          <a href="#stories" className="primary-button mt-8">Explore the Journal <ArrowRight size={18} /></a>
          <Sparkles aria-hidden="true" className="pointer-events-none absolute right-[5%] top-6 hidden h-20 w-20 rotate-12 text-coral/50 lg:block" />
        </div>
      </header>

      <section id="stories" className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="memo text-primary">From the front desk</p><h2 className="section-title mt-2">Fresh from the Journal.</h2></div>
          <label className="flex min-h-12 items-center gap-2 rounded-full border-2 border-foreground bg-paper px-4"><Search size={18} /><span className="sr-only">Search Journal stories</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search stories" className="min-w-0 bg-transparent outline-none" /></label>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Filter Journal category">
          {categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold transition ${category === item ? "bg-sun" : "bg-paper hover:bg-secondary"}`}>{item}</button>)}
        </div>
        {visible.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => <Link key={post.slug} to="/journal/$slug" params={{ slug: post.slug }} className="group overflow-hidden rounded-2xl border-2 border-foreground bg-paper shadow-[5px_5px_0_var(--color-foreground)] transition hover:-translate-y-1">
              {post.hero_image_url && post.hero_image_alt ? <img src={post.hero_image_url} alt={post.hero_image_alt} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-secondary"><BookOpen size={56} aria-hidden="true" className="text-primary" /></div>}
              <div className="p-6"><p className="memo text-coral">{post.category} · {post.reading_time_minutes ?? 1} min read</p><h3 className="mt-3 font-display text-2xl font-semibold leading-tight group-hover:underline">{post.title}</h3><p className="mt-3 line-clamp-3 text-muted-foreground">{post.excerpt}</p><span className="mt-6 inline-flex items-center gap-2 font-bold text-primary">Read the story <ArrowRight size={17} /></span></div>
            </Link>)}
          </div>
        ) : <p className="mt-10 rounded-xl border-2 border-foreground bg-paper p-6">No stories match that search. Try another phrase or category.</p>}
      </section>
      <IslandFooter />
    </main>
  );
}
