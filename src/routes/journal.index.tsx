import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FlaskConical, GraduationCap, Landmark, Search, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Keep the Vibes Going · LOCKHABIT Journal Design Handoff" },
      { name: "description", content: "Design handoff for the future LOCKHABIT Journal publishing experience." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Journal,
});

type Category = "All" | "Ingredients" | "Rituals" | "Research Notes" | "Travel Brighter" | "FAQs";

type SamplePost = {
  id: number;
  title: string;
  excerpt: string;
  category: Exclude<Category, "All">;
  date: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
};

const samplePosts: SamplePost[] = [
  { id: 1, title: "Turmeric & Skin Care: What Research Can and Can’t Tell Us", excerpt: "A design-preview article structure for separating tradition, research, limits, and rinse-off context.", category: "Research Notes", date: "Design preview", image: products[11]!.images[0]!.src, imageAlt: "LOCKHABIT Kojic Acid & Turmeric Soap", featured: true },
  { id: 2, title: "Activated Charcoal in Soap: Questions Worth Asking", excerpt: "How a future Journal entry can explain an ingredient without turning supplier copy into a medical claim.", category: "Ingredients", date: "Design preview", image: products[9]!.images[0]!.src, imageAlt: "LOCKHABIT Charcoal Soap" },
  { id: 3, title: "Shea Butter: Raw, Unrefined, and Simple", excerpt: "A sample ingredient spotlight layout with sourcing, use, limits, and references.", category: "Ingredients", date: "Design preview", image: products[10]!.images[0]!.src, imageAlt: "LOCKHABIT Raw Shea Butter" },
  { id: 4, title: "Essential Oils vs. Fragrance: Read the Label First", excerpt: "A future explainer pattern for definitions, formulation context, and evidence boundaries.", category: "Research Notes", date: "Design preview", image: products[8]!.images[0]!.src, imageAlt: "LOCKHABIT Calming Lavender Soap" },
  { id: 5, title: "Five Ways to Make a Shower Feel Less Rushed", excerpt: "A lighter lifestyle article format for rituals that stays away from unsupported wellness promises.", category: "Rituals", date: "Design preview", image: products[0]!.images[1]!.src, imageAlt: "LOCKHABIT Coconut Beach Soap" },
  { id: 6, title: "How to Build a Travel-Friendly Body Care Routine", excerpt: "A practical packing-format article with product care, bar storage, and simple routine planning.", category: "Travel Brighter", date: "Design preview", image: products[2]!.images[0]!.src, imageAlt: "LOCKHABIT Aloe & Cool Cucumber Soap" },
  { id: 7, title: "What Does ‘Fragrance-Free’ Actually Mean on a Formula?", excerpt: "A reusable FAQ-led format that distinguishes label wording from assumptions.", category: "FAQs", date: "Design preview", image: products[11]!.images[1]!.src, imageAlt: "LOCKHABIT Kojic Acid & Turmeric Soap" },
  { id: 8, title: "Coconut Oil in Rinse-Off Products", excerpt: "A sample research outline for ingredient function, formulation context, and what studies do not prove.", category: "Ingredients", date: "Design preview", image: products[0]!.images[2]!.src, imageAlt: "LOCKHABIT Coconut Beach Soap" },
  { id: 9, title: "Oat, Milk, Honey: Reading a Product Name Carefully", excerpt: "A transparency-first article pattern for names, ingredients, and consumer expectations.", category: "FAQs", date: "Design preview", image: products[7]!.images[0]!.src, imageAlt: "LOCKHABIT Oat Milk & Honey Soap" },
  { id: 10, title: "The Bar-Drying Habit That Makes Soap Last Longer", excerpt: "A simple utility post format built for search, related products, and internal linking.", category: "Rituals", date: "Design preview", image: products[5]!.images[0]!.src, imageAlt: "LOCKHABIT Lemongrass & Sage Soap" },
];

const categories: Category[] = ["All", "Ingredients", "Rituals", "Research Notes", "Travel Brighter", "FAQs"];
const PAGE_SIZE = 6;

function Journal() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samplePosts.filter((post) => {
      const categoryMatch = category === "All" || post.category === category;
      const queryMatch = !q || (post.title + " " + post.excerpt + " " + post.category).toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const featured = samplePosts.find((post) => post.featured)!;

  const chooseCategory = (value: Category) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <JournalSubnav />

      <section className="relative overflow-hidden border-b-2 border-foreground bg-[#f4e4bd] px-5 py-12 lg:px-10 lg:py-16">
        <div className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-coral/15" aria-hidden="true" />
        <div className="absolute -right-20 -bottom-28 h-80 w-80 rounded-full bg-pool/25" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="memo text-coral">Good ingredients · brighter days · real references</p>
          <h1 className="mx-auto mt-4 max-w-5xl font-slab text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.88]">
            <span className="text-coral">Keep the</span><br /><span className="text-[#173c2d]">vibes going.</span>
          </h1>
          <p className="mt-3 font-display text-2xl font-semibold">The LockHabit Journal</p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Ingredient stories, research notes, practical routines, and brand-world reading — built to show supportive, mixed, negative, and limited evidence honestly.
          </p>

          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-full border-2 border-foreground bg-paper px-5 py-3 shadow-[4px_4px_0_var(--color-foreground)]">
            <Search size={20} className="shrink-0 text-primary" />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Search the future Journal…"
              className="min-w-0 flex-1 bg-transparent outline-none"
              aria-label="Search Journal design-preview posts"
            />
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-paper px-5 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => chooseCategory(item)}
              className={`shrink-0 rounded-full border-2 border-foreground px-4 py-2 text-xs font-black ${category === item ? "bg-coral text-coral-foreground" : "bg-background"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {!query && category === "All" ? (
        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
          <p className="eyebrow">Featured article · design preview</p>
          <article className="grid overflow-hidden rounded-[1.6rem] border-2 border-foreground bg-paper shadow-[7px_7px_0_var(--color-foreground)] lg:grid-cols-[.9fr_1.1fr]">
            <div className="p-7 lg:p-9">
              <span className="rounded-full bg-sun px-3 py-1 text-[0.65rem] font-black uppercase">{featured.category}</span>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.02] lg:text-5xl">{featured.title}</h2>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{featured.excerpt}</p>
              <Link to="/journal/article-template" className="primary-button mt-7">Read the design template <ArrowRight size={17} /></Link>
              <p className="memo mt-5 text-muted-foreground">Sample only · not published health advice</p>
            </div>
            <img src={featured.image} alt={featured.imageAlt} className="min-h-[340px] h-full w-full object-cover" />
          </article>
        </section>
      ) : null}

      <ResearchTrust />

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Journal archive UX</p>
            <h2 className="section-title">{filtered.length ? "Browse the stacks." : "No matches yet."}</h2>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Architecture preview: search + category + pagination.</p>
            <p>Cursor can map the same components to hundreds of published records.</p>
          </div>
        </div>

        {visible.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-foreground bg-paper p-10 text-center">
            <Sparkles className="mx-auto text-coral" />
            <h3 className="mt-4 font-display text-3xl font-semibold">Nothing under that beach towel.</h3>
            <p className="mt-2 text-muted-foreground">Try another search or category.</p>
            <button className="secondary-button mt-5" onClick={() => { setQuery(""); chooseCategory("All"); }}>Clear filters</button>
          </div>
        )}

        {filtered.length > PAGE_SIZE ? (
          <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Journal design-preview pagination">
            <button disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="secondary-button disabled:opacity-40">Previous</button>
            <span className="memo px-3">Page {safePage} of {totalPages}</span>
            <button disabled={safePage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="secondary-button disabled:opacity-40">Next</button>
          </nav>
        ) : null}
      </section>

      <section className="border-y-2 border-foreground bg-sun/35 px-5 py-9 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo text-primary">Coming soon state</p><h3 className="mt-2 font-display text-2xl font-semibold">Ready before the first post.</h3><p className="mt-2 text-sm text-muted-foreground">Use the polished noindex holding page until real articles are ready.</p><Link to="/journal/coming-soon" className="secondary-button mt-5">Open coming soon</Link></div>
          <div className="rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo text-primary">Article template</p><h3 className="mt-2 font-display text-2xl font-semibold">Evidence has a place to live.</h3><p className="mt-2 text-sm text-muted-foreground">Supportive evidence, mixed results, limitations, safety, references, related products.</p><Link to="/journal/article-template" className="secondary-button mt-5">Open template</Link></div>
          <div className="rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo text-primary">Scale</p><h3 className="mt-2 font-display text-2xl font-semibold">One post or hundreds.</h3><p className="mt-2 text-sm text-muted-foreground">Search, category filters, pagination, reusable cards, and archive structure are already represented in the UX.</p></div>
        </div>
      </section>

      <IslandFooter />
    </main>
  );
}

function JournalSubnav() {
  return (
    <div className="border-b-2 border-foreground bg-[#173c2d] text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-10">
        <div><span className="memo text-sun">Keep the Vibes Going</span><span className="ml-3 hidden text-sm sm:inline">The LockHabit Journal</span></div>
        <div className="flex items-center gap-3 text-xs font-black uppercase"><Link to="/journal/coming-soon">Coming soon</Link><span>·</span><Link to="/journal/article-template">Article template</Link></div>
      </div>
    </div>
  );
}

function ResearchTrust() {
  return (
    <section className="border-y-2 border-foreground bg-secondary px-5 py-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-4 text-center sm:grid-cols-4">
        <TrustIcon icon={<Landmark />} title=".gov" note="Government resources" />
        <TrustIcon icon={<GraduationCap />} title=".edu" note="Academic research" />
        <TrustIcon icon={<FlaskConical />} title="PubMed / NLM" note="Literature discovery" />
        <TrustIcon icon={<BookOpen />} title="Peer review" note="Studies & reviews" />
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted-foreground">These are source types and research tools, not endorsements of LockHabit. Future articles still evaluate each source on its own merits.</p>
    </section>
  );
}

function TrustIcon({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return <div className="flex items-center justify-center gap-3 sm:block"><div className="text-primary sm:mx-auto sm:w-fit">{icon}</div><div><p className="font-display text-xl font-semibold">{title}</p><p className="text-xs text-muted-foreground">{note}</p></div></div>;
}

function PostCard({ post }: { post: SamplePost }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-foreground bg-paper shadow-[4px_4px_0_var(--color-foreground)] transition hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden border-b-2 border-foreground"><img src={post.image} alt={post.imageAlt} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" /></div>
      <div className="p-5">
        <span className="rounded-full bg-secondary px-3 py-1 text-[0.62rem] font-black uppercase">{post.category}</span>
        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">{post.title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3"><span className="memo text-muted-foreground">{post.date}</span><Link to="/journal/article-template" className="font-bold text-coral underline underline-offset-4">Read preview →</Link></div>
      </div>
    </article>
  );
}
