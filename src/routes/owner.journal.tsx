import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerGrowth, saveOwnerJournal } from "@/lib/owner-growth.functions";
import { editableJournalBody, publishedJournalBlocks } from "@/lib/journal-content";

export const Route = createFileRoute("/owner/journal")({
  head: () => ({
    meta: [
      { title: "Journal administration · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: OwnerJournal,
});
type Post = Awaited<ReturnType<typeof getOwnerGrowth>>["posts"][number];
const journalCategories = ["Ingredients", "Rituals", "Research Notes", "Travel Brighter", "FAQs", "Brighter Travels", "Everyday Rituals", "Ingredient Notes"];
type RecommendationRow = { kind: "own" | "affiliate"; label: string; destination: string; note: string };
function rowsForPost(post: Post | null): RecommendationRow[] {
  return publishedJournalBlocks(post?.body).flatMap((block): RecommendationRow[] => {
    if (block.type === "own_product") return [{ kind: "own", label: "LockHabit product", destination: block.slug, note: block.note }];
    if (block.type === "affiliate") return [{ kind: "affiliate", label: block.label, destination: block.url, note: block.note }];
    return [];
  });
}
function OwnerJournal() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("Checking owner access…");
  const [busy, setBusy] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  function openEditor(post: Post | null) {
    setEditing(post);
    setRecommendations(rowsForPost(post));
    setOpen(true);
  }
  function editRecommendation(index: number, patch: Partial<RecommendationRow>) {
    setRecommendations((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  }
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setToken(data.session?.access_token ?? "");
      if (active && !data.session) setNotice("Sign in to the owner orders dashboard first.");
    });
    return () => {
      active = false;
    };
  }, []);
  async function refresh(accessToken = token) {
    try {
      const result = await getOwnerGrowth({ data: { accessToken } });
      setPosts(result.posts);
      setNotice("");
    } catch {
      setPosts(null);
      setNotice("Owner access is required. Sign in through the orders dashboard.");
    }
  }
  useEffect(() => {
    if (token) void refresh(token);
  }, [token]);
  async function save(element: HTMLFormElement, status: "draft" | "in_review" | "published") {
    setBusy(true);
    setNotice("");
    const form = new FormData(element);
    try {
      await saveOwnerJournal({
        data: {
          accessToken: token,
          ...(editing ? { id: editing.id } : {}),
          title: String(form.get("title") ?? ""),
          slug: String(form.get("slug") ?? ""),
          category: String(form.get("category") ?? ""),
          excerpt: String(form.get("excerpt") ?? ""),
          body: String(form.get("body") ?? ""),
          recommendations: recommendations.filter((row) => row.label || row.destination || row.note)
            .map((row) => [row.kind, row.label, row.destination, row.note].map((value) => value.replaceAll("|", " ")).join(" | ")).join("\n"),
          references: String(form.get("references") ?? ""),
          author: String(form.get("author") ?? ""),
          heroImageUrl: String(form.get("heroImageUrl") ?? ""),
          heroImageAlt: String(form.get("heroImageAlt") ?? ""),
          seoTitle: String(form.get("seoTitle") ?? ""),
          seoDescription: String(form.get("seoDescription") ?? ""),
          status,
        },
      });
      setOpen(false);
      setEditing(null);
      await refresh();
      setNotice("Article saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save article.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f5efe2] px-5 py-8 text-foreground lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-bold">
            LOCKHABIT
          </Link>
          <Link to="/admin/orders" className="secondary-button">
            Owner orders & sign in
          </Link>
        </div>
        <p className="eyebrow mt-9">Owner tools</p>
        <h1 className="section-title">Journal publishing.</h1>
        {notice ? (
          <p role="status" className="mt-4 rounded-xl bg-paper p-4">
            {notice}
          </p>
        ) : null}
        {posts ? (
          <>
            <button
              className="primary-button mt-6"
              onClick={() => openEditor(null)}
            >
              New article
            </button>
            <div className="mt-5 grid gap-4">
              {posts.length === 0 ? (
                <p>No articles have been written. The public Journal remains hidden.</p>
              ) : (
                posts.map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-foreground bg-paper p-5"
                  >
                    <div>
                      <h2 className="font-display text-xl">{post.title}</h2>
                      <p className="text-sm">
                        /{post.slug} · {post.category} · {post.status} · Updated{" "}
                        {new Date(post.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => openEditor(post)}
                    >
                      Open editor
                    </button>
                  </article>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="mt-4">Journal data is available after owner sign in.</p>
        )}
        {open && posts ? (
          <div
            className="fixed inset-0 z-[90] overflow-y-auto bg-foreground/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Article editor"
          >
            <form
              key={editing?.id ?? "new"}
              onSubmit={(event) => {
                event.preventDefault();
                void save(event.currentTarget, "draft");
              }}
              className="mx-auto max-w-2xl space-y-4 rounded-2xl bg-paper p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl">
                  {editing ? "Edit article" : "New article"}
                </h2>
                <button type="button" className="secondary-button" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
              <label className="block">
                Title
                <input
                  name="title"
                  required
                  defaultValue={editing?.title}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Slug
                <input
                  name="slug"
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  defaultValue={editing?.slug}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Category
                <select
                  name="category"
                  defaultValue={editing?.category ?? "Ingredients"}
                  className="mt-1 w-full rounded border p-3"
                >
                  {[...new Set([...journalCategories, ...(editing?.category ? [editing.category] : [])])].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="block">
                Excerpt
                <textarea
                  name="excerpt"
                  maxLength={500}
                  defaultValue={editing?.excerpt}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Author
                <input
                  name="author"
                  required
                  defaultValue={editing?.author ?? "LOCKHABIT Editorial"}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Hero image URL
                <input
                  name="heroImageUrl"
                  type="url"
                  defaultValue={editing?.hero_image_url ?? ""}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Hero image alt text
                <input
                  name="heroImageAlt"
                  defaultValue={editing?.hero_image_alt ?? ""}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Search title
                <input
                  name="seoTitle"
                  defaultValue={editing?.seo_title ?? ""}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Search description
                <textarea
                  name="seoDescription"
                  defaultValue={editing?.seo_description ?? ""}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <label className="block">
                Article body
                <textarea
                  name="body"
                  rows={12}
                  defaultValue={editableJournalBody(editing?.body)}
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <p className="text-sm text-muted-foreground">Separate paragraphs with a blank line; start a section title with ##. Keep evidence and limitations near the claims they support.</p>
              <fieldset className="space-y-3 rounded-xl border-2 border-foreground p-4">
                <legend className="px-2 font-display text-xl font-semibold">Helpful recommendations</legend>
                <p className="text-sm text-muted-foreground">Add a LockHabit bar or an outside product only when it genuinely helps. Paid outside links are visibly disclosed beside the recommendation.</p>
                {recommendations.map((row, index) => <div key={index} className="grid gap-2 rounded-xl bg-background p-3">
                  <p className="memo text-coral">{row.kind === "own" ? "Your own LockHabit product" : "Outside paid recommendation"}</p>
                  {row.kind === "affiliate" ? <label className="grid gap-1 text-sm">Product name<input value={row.label} maxLength={120} onChange={(event) => editRecommendation(index, { label: event.target.value })} className="rounded border p-2" /></label> : null}
                  <label className="grid gap-1 text-sm">{row.kind === "affiliate" ? "Your secure partner link (https://)" : "Existing LockHabit product slug"}<input value={row.destination} onChange={(event) => editRecommendation(index, { destination: event.target.value })} className="rounded border p-2" placeholder={row.kind === "affiliate" ? "https://partner.example/item" : "coconut-beach-soap"} /></label>
                  <label className="grid gap-1 text-sm">Why it fits this article<textarea value={row.note} maxLength={500} onChange={(event) => editRecommendation(index, { note: event.target.value })} rows={2} className="rounded border p-2" /></label>
                  <button type="button" className="justify-self-start text-sm font-bold underline" onClick={() => setRecommendations((current) => current.filter((_, i) => i !== index))}>Remove recommendation</button>
                </div>)}
                <div className="flex flex-wrap gap-2"><button type="button" className="secondary-button" onClick={() => setRecommendations((current) => [...current, { kind: "own", label: "LockHabit product", destination: "", note: "" }])}>Add LockHabit product</button><button type="button" className="secondary-button" onClick={() => setRecommendations((current) => [...current, { kind: "affiliate", label: "", destination: "", note: "" }])}>Add paid outside link</button></div>
              </fieldset>
              <label className="block">
                References, one per line
                <textarea
                  name="references"
                  rows={5}
                  defaultValue={
                    Array.isArray(editing?.reference_items)
                      ? editing.reference_items.join("\n")
                      : ""
                  }
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
              <p className="text-sm">
                Published articles need 250+ words and two direct source URLs. Review evidence, safety, claims and every outside recommendation before publishing. The Journal remains unindexed until editorial launch.
              </p>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} type="submit" className="secondary-button">
                  Save draft
                </button>
                <button
                  disabled={busy}
                  type="button"
                  onClick={(event) => void save(event.currentTarget.form!, "in_review")}
                  className="secondary-button"
                >
                  Send to review
                </button>
                <button
                  disabled={busy}
                  type="button"
                  onClick={(event) => void save(event.currentTarget.form!, "published")}
                  className="dark-button"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}
