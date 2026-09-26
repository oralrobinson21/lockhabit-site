import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerGrowth, saveOwnerJournal } from "@/lib/owner-growth.functions";

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
function OwnerJournal() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("Checking owner access…");
  const [busy, setBusy] = useState(false);
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
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
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
                      onClick={() => {
                        setEditing(post);
                        setOpen(true);
                      }}
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
                  {["Ingredients", "Rituals", "Research Notes", "Travel Brighter", "FAQs"].map(
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
                  defaultValue={
                    Array.isArray(editing?.body)
                      ? ((editing.body[0] as { text?: string } | undefined)?.text ?? "")
                      : ""
                  }
                  className="mt-1 w-full rounded border p-3"
                />
              </label>
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
                Published articles require a body and references. Review evidence, safety, and
                claims before publishing.
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
