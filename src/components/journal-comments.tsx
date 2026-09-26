import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getApprovedJournalComments,
  submitJournalComment,
} from "@/lib/journal-comments.functions";

export function JournalComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<
    Array<{ id: string; author_name: string; body: string; created_at: string }>
  >([]);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let live = true;
    void getApprovedJournalComments({ data: { slug } }).then((rows) => {
      if (live) setComments(rows);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (live) setSignedIn(Boolean(data.session?.access_token && data.session.user.email_confirmed_at));
    });
    return () => {
      live = false;
    };
  }, [slug]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Sign in with a verified email to comment.");
      const result = await submitJournalComment({
        data: { accessToken, slug, name, body },
      });
      setNotice(result.notice);
      setBody("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Comment could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  if (!open && comments.length === 0) return null;

  return (
    <section className="mt-14 border-t-2 border-foreground pt-10" aria-label="Article comments">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Quiet conversation</p>
          <h2 className="font-display text-3xl font-semibold">Comments</h2>
        </div>
        <button type="button" className="text-sm font-bold underline underline-offset-4" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <div className="mt-6 space-y-6">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved comments yet. Be thoughtful — new notes stay private until reviewed.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-2xl border-2 border-foreground/20 bg-paper p-4">
                  <p className="font-bold">{comment.author_name}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
          {signedIn ? (
            <form className="rounded-2xl border-2 border-foreground bg-background p-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="memo">Name</span>
                <input
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-full border-2 border-foreground bg-paper px-4 py-2"
                />
              </label>
              <label className="mt-4 block">
                <span className="memo">Comment</span>
                <textarea
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={4}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="mt-2 w-full rounded-2xl border-2 border-foreground bg-paper px-4 py-3"
                />
              </label>
              <button disabled={busy} className="secondary-button mt-4">
                {busy ? "Sending…" : "Submit for review"}
              </button>
              {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link to="/sign-in" className="font-bold underline underline-offset-4">
                Sign in
              </Link>{" "}
              with a verified email to leave a comment.{" "}
              <Link to="/join" className="font-bold underline underline-offset-4">
                Create a reader account
              </Link>
              .
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
