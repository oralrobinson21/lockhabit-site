import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, FilePlus2, Filter, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export const Route = createFileRoute("/owner/journal")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Journal Admin · Design Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OwnerJournal,
});

type Status = "Draft" | "In review" | "Scheduled" | "Published";

const posts = [
  { title: "Turmeric & Skin Care: What Research Can and Can’t Tell Us", category: "Research Notes", status: "In review" as Status, updated: "Sep 25", author: "LOCKHABIT Editorial" },
  { title: "Activated Charcoal in Soap: Questions Worth Asking", category: "Ingredients", status: "Draft" as Status, updated: "Sep 24", author: "LOCKHABIT Editorial" },
  { title: "Five Ways to Make a Shower Feel Less Rushed", category: "Rituals", status: "Scheduled" as Status, updated: "Sep 23", author: "LOCKHABIT Editorial" },
  { title: "How to Build a Travel-Friendly Body Care Routine", category: "Travel Brighter", status: "Published" as Status, updated: "Sep 20", author: "LOCKHABIT Editorial" },
  { title: "What Does Fragrance-Free Mean on a Formula?", category: "FAQs", status: "Draft" as Status, updated: "Sep 18", author: "LOCKHABIT Editorial" },
];

const statusOptions: Array<"All" | Status> = ["All", "Draft", "In review", "Scheduled", "Published"];

function OwnerJournal() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [editorOpen, setEditorOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((post) => {
      const searchMatch = !q || (post.title + " " + post.category + " " + post.author).toLowerCase().includes(q);
      const statusMatch = status === "All" || post.status === status;
      return searchMatch && statusMatch;
    });
  }, [query, status]);

  return (
    <main className="min-h-screen bg-[#f5efe2] text-foreground">
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 lg:px-10">
          <Link to="/" className="brand-logo"><img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" /></Link>
          <div className="text-right"><p className="memo text-primary">Owner tools</p><p className="text-xs font-bold">Journal publishing · design handoff</p></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Journal operations</p>
            <h1 className="section-title">One article or three hundred.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Search, filter, review, schedule, and publish without turning the business side into a bloated CMS.</p>
          </div>
          <button className="primary-button" onClick={() => setEditorOpen(true)}><FilePlus2 size={17} /> New article</button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          <Metric label="Drafts" value="2" />
          <Metric label="In review" value="1" />
          <Metric label="Scheduled" value="1" />
          <Metric label="Published" value="1" />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-foreground bg-background">
          <div className="flex flex-col gap-3 border-b-2 border-foreground p-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-full border-2 border-foreground bg-paper px-4 py-2">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search title, category, or author" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter size={16} className="shrink-0" />
              {statusOptions.map((option) => (
                <button key={option} onClick={() => setStatus(option)} className={`shrink-0 rounded-full border-2 border-foreground px-3 py-2 text-[0.62rem] font-black uppercase ${status === option ? "bg-sun" : "bg-paper"}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>{["Article", "Category", "Status", "Updated", "Author", ""].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs uppercase">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.title} className="border-t border-border">
                    <td className="min-w-[300px] px-4 py-4"><p className="font-display text-lg font-semibold leading-tight">{post.title}</p></td>
                    <td className="px-4 py-4">{post.category}</td>
                    <td className="px-4 py-4"><StatusPill status={post.status} /></td>
                    <td className="px-4 py-4">{post.updated}</td>
                    <td className="px-4 py-4">{post.author}</td>
                    <td className="px-4 py-4"><button className="secondary-button whitespace-nowrap">Open editor</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length ? <div className="p-10 text-center"><BookOpen className="mx-auto text-coral" /><p className="mt-4 font-display text-2xl font-semibold">No articles match that filter.</p></div> : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Rule icon={<ShieldCheck />} title="Research gate" text="Article cannot publish until references, evidence limits, and review date are complete." />
          <Rule icon={<CalendarClock />} title="Schedule cleanly" text="Draft, review, schedule, and publish states stay obvious at a glance." />
          <Rule icon={<BookOpen />} title="Scale without clutter" text="Server-side pagination/search can replace this demo list without changing the owner UX." />
        </div>
      </section>

      {editorOpen ? <EditorSheet onClose={() => setEditorOpen(false)} /> : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border-2 border-foreground bg-paper p-4 shadow-[3px_3px_0_var(--color-foreground)]"><p className="memo text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-semibold">{value}</p></div>;
}

function StatusPill({ status }: { status: Status }) {
  const tone = status === "Published" ? "bg-secondary" : status === "Scheduled" ? "bg-sun" : status === "In review" ? "bg-coral/20" : "bg-muted";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

function Rule({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border-2 border-foreground bg-background p-5"><div className="text-primary">{icon}</div><p className="mt-3 font-bold">{title}</p><p className="mt-2 text-sm text-muted-foreground">{text}</p></div>;
}

function EditorSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] bg-foreground/45 backdrop-blur-sm" onMouseDown={onClose}>
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l-2 border-foreground bg-paper p-6 shadow-[-8px_0_0_var(--color-foreground)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">Article editor UX</p><h2 className="font-display text-4xl font-semibold">New Journal entry</h2></div>
          <button className="secondary-button" onClick={onClose}>Close</button>
        </div>
        <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <Field label="Title"><input className="field" placeholder="Article title" /></Field>
          <Field label="Slug"><input className="field" placeholder="article-slug" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><select className="field"><option>Ingredients</option><option>Rituals</option><option>Research Notes</option><option>Travel Brighter</option><option>FAQs</option></select></Field>
            <Field label="Status"><select className="field"><option>Draft</option><option>In review</option><option>Scheduled</option></select></Field>
          </div>
          <Field label="Excerpt"><textarea className="field min-h-24" placeholder="Short summary for cards and search previews" /></Field>
          <Field label="Hero image / alt text"><div className="grid gap-3 sm:grid-cols-2"><button className="secondary-button justify-center">Choose image</button><input className="field" placeholder="Image alt text" /></div></Field>
          <div className="rounded-2xl border-2 border-foreground bg-sun/25 p-4">
            <p className="memo">Editorial sections</p>
            <p className="mt-2 text-sm text-muted-foreground">Short answer · what it is · traditional use · research studied · supportive evidence · mixed/negative evidence · limitations · rinse-off vs leave-on · safety · references.</p>
          </div>
          <Field label="References checklist"><textarea className="field min-h-28" placeholder=".gov / .edu / PubMed / peer-reviewed sources and notes" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="secondary-button justify-center">Save draft</button>
            <button className="dark-button justify-center">Send to review</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="memo">{label}</span><div className="mt-2">{children}</div></label>;
}
