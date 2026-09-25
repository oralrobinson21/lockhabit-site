import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CalendarDays, ExternalLink, FlaskConical, Leaf, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/journal/article-template")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Journal Article Template · Design Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ArticleTemplate,
});

const sections = [
  {
    id: "short-answer",
    label: "Short answer",
    title: "Start with the answer a reader actually came for.",
    body: "DESIGN PREVIEW: This block is where an editor summarizes what the evidence supports, what it does not establish, and whether the discussion applies to rinse-off products, leave-on products, or both.",
  },
  {
    id: "what-it-is",
    label: "Ingredient basics",
    title: "What the ingredient is",
    body: "DESIGN PREVIEW: Define the ingredient plainly, distinguish cosmetic or formulation roles from marketing language, and link terminology readers may not know.",
  },
  {
    id: "traditional-use",
    label: "Context",
    title: "Traditional use",
    body: "DESIGN PREVIEW: Describe traditional or historical use as tradition, not as proof of effectiveness. This section needs reliable historical or ethnobotanical sourcing when published.",
  },
  {
    id: "research",
    label: "Evidence",
    title: "What research studied",
    body: "DESIGN PREVIEW: Explain study design, population, formulation, concentration, duration, comparator, and outcome. Do not transfer findings from a different formulation directly to a LockHabit rinse-off product.",
  },
  {
    id: "supportive",
    label: "Evidence",
    title: "Supportive evidence",
    body: "DESIGN PREVIEW: Summarize relevant findings with citations and confidence limits. Avoid turning statistically significant findings into broader promises than the study supports.",
  },
  {
    id: "mixed",
    label: "Evidence",
    title: "Mixed or negative evidence",
    body: "DESIGN PREVIEW: Include studies or reviews that found limited, inconsistent, null, or uncertain results. The Journal should not cherry-pick.",
  },
  {
    id: "limits",
    label: "Limits",
    title: "What the evidence cannot tell us",
    body: "DESIGN PREVIEW: Call out small samples, short follow-up, formulation differences, publication bias, indirect outcomes, and unanswered questions.",
  },
  {
    id: "rinse-off",
    label: "Product context",
    title: "Rinse-off vs. leave-on matters",
    body: "DESIGN PREVIEW: Explain why contact time and formulation matter before connecting ingredient research to soap or body-care products.",
  },
  {
    id: "safety",
    label: "Safety",
    title: "Safety notes",
    body: "DESIGN PREVIEW: Include appropriate patch-test, eye-contact, irritation, allergy, pregnancy or medical-context, or professional-advice language only when supported and relevant to the specific article.",
  },
];

function ArticleTemplate() {
  const related = [products[11]!, products[9]!, products[10]!];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article>
        <header className="border-b-2 border-foreground bg-[#f5e5bd] px-5 py-12 lg:px-10 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <Link to="/journal" className="inline-flex items-center gap-2 text-sm font-black text-coral underline underline-offset-4">
              <ArrowLeft size={16} /> Back to Journal
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black uppercase">Research Notes</span>
              <span className="rounded-full border-2 border-foreground bg-paper px-3 py-1 text-xs font-black uppercase">Design preview · not published advice</span>
            </div>
            <h1 className="mt-5 font-display text-[clamp(3rem,7vw,5.7rem)] font-semibold leading-[.95]">
              Turmeric & skin care: what research can and can’t tell us
            </h1>
            <p className="mt-6 max-w-3xl text-xl text-muted-foreground">
              A fully structured article layout showing exactly where evidence, limitations, formulation context, safety notes, and references belong before any real Journal post is published.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="flex items-center gap-2"><CalendarDays size={17} /> Published: design preview</span>
              <span className="flex items-center gap-2"><ShieldCheck size={17} /> Last reviewed: design preview</span>
              <span className="flex items-center gap-2"><BookOpen size={17} /> ~8 min layout</span>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[220px_minmax(0,760px)_240px] lg:px-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border-2 border-foreground bg-paper p-4">
              <p className="memo text-primary">In this article</p>
              <nav className="mt-3 space-y-2 text-sm">
                {sections.map((section) => (
                  <a key={section.id} href={"#" + section.id} className="block rounded-lg px-2 py-2 hover:bg-muted">
                    {section.title}
                  </a>
                ))}
                <a href="#references" className="block rounded-lg px-2 py-2 hover:bg-muted">References</a>
              </nav>
            </div>
          </aside>

          <div>
            <div className="rounded-2xl border-2 border-foreground bg-sun/30 p-5">
              <p className="memo">Editorial rule</p>
              <p className="mt-2">
                Future published copy must be sourced article by article. The sample language on this page is structure, not a factual turmeric review.
              </p>
            </div>

            {sections.map((section) => (
              <section id={section.id} key={section.id} className="scroll-mt-28 border-b border-foreground/20 py-9">
                <p className="memo text-coral">{section.label}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{section.title}</h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">{section.body}</p>
                {section.id === "research" ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <EvidenceCard icon={<FlaskConical />} title="Study design" text="Population, comparator, duration, formulation." />
                    <EvidenceCard icon={<Leaf />} title="Product context" text="Ingredient form, concentration, rinse-off or leave-on." />
                    <EvidenceCard icon={<ShieldCheck />} title="Confidence" text="Limits, uncertainty, and relevance." />
                  </div>
                ) : null}
              </section>
            ))}

            <section id="references" className="scroll-mt-28 py-9">
              <p className="memo text-primary">References</p>
              <h2 className="mt-2 font-display text-4xl font-semibold">Every factual claim gets a trail.</h2>
              <p className="mt-4 text-muted-foreground">
                These are placeholder rows showing the citation UX. Replace them with real article-specific sources before publication.
              </p>
              <div className="mt-6 space-y-3">
                <Reference type=".gov / agency" title="Source title goes here" note="Publisher · year · direct URL" />
                <Reference type="PubMed / NLM" title="Peer-reviewed study or review title" note="Journal · year · PMID or DOI" />
                <Reference type=".edu / university" title="Academic source title" note="Institution · date · direct URL" />
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl border-2 border-foreground bg-secondary p-5">
                <p className="memo">Article facts</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="font-bold">Author</dt><dd className="text-muted-foreground">LOCKHABIT Editorial</dd></div>
                  <div><dt className="font-bold">Category</dt><dd className="text-muted-foreground">Research Notes</dd></div>
                  <div><dt className="font-bold">Review status</dt><dd className="text-muted-foreground">Design preview only</dd></div>
                </dl>
              </div>
              <div className="rounded-2xl border-2 border-foreground bg-paper p-5">
                <p className="memo text-coral">Related products</p>
                <div className="mt-4 space-y-4">
                  {related.map((product) => (
                    <Link key={product.id} to="/soaps/$slug" params={{ slug: product.slug }} className="flex gap-3">
                      <img src={product.images[0]?.src} alt="" className="h-16 w-16 rounded-lg border-2 border-foreground object-cover" />
                      <div>
                        <p className="font-display font-semibold leading-tight">{product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{"$" + product.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-y-2 border-foreground bg-coral px-5 py-10 text-coral-foreground lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="memo text-coral-foreground/80">Related article rail</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Keep reading without losing the plot.</h2>
          <p className="mt-3 max-w-2xl">Cursor can populate this from shared categories and tags once the real article model is wired.</p>
        </div>
      </section>

      <IslandFooter />
    </main>
  );
}

function EvidenceCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border-2 border-foreground bg-paper p-4">
      <div className="text-primary">{icon}</div>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Reference({ type, title, note }: { type: string; title: string; note: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-foreground bg-paper p-4">
      <div>
        <p className="memo text-primary">{type}</p>
        <p className="mt-2 font-bold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
      <ExternalLink className="mt-1 shrink-0 text-coral" size={18} />
    </div>
  );
}
