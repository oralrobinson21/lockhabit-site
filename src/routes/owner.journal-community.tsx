import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getOwnerJournalCommunity,
  moderateJournalComment,
  setOwnerJournalSettings,
} from "@/lib/journal-community.functions";

type Data = Awaited<ReturnType<typeof getOwnerJournalCommunity>>;

export const Route = createFileRoute("/owner/journal-community")({
  head: () => ({
    meta: [
      { title: "Journal community controls · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: OwnerJournalCommunity,
});

function OwnerJournalCommunity() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [notice, setNotice] = useState("Checking owner access…");
  const [busy, setBusy] = useState(false);

  async function load(accessToken: string) {
    try {
      const next = await getOwnerJournalCommunity({ data: { accessToken } });
      setData(next);
      setNotice("");
    } catch {
      setNotice("Owner access is required.");
    }
  }

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      const accessToken = sessionData.session?.access_token ?? "";
      setToken(accessToken);
      if (accessToken) void load(accessToken);
      else setNotice("Sign in to the owner dashboard first.");
    });
    return () => { active = false; };
  }, []);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !data) return;
    setBusy(true);
    try {
      await setOwnerJournalSettings({
        data: {
          accessToken: token,
          commentsEnabled: data.settings.commentsEnabled,
          supporterEnabled: data.settings.supporterEnabled,
          digestSendingEnabled: data.settings.digestSendingEnabled,
          reactionsEnabled: data.settings.reactionsEnabled,
          authorFollowsEnabled: data.settings.authorFollowsEnabled,
          accountSignupEnabled: data.settings.accountSignupEnabled,
        },
      });
      await load(token);
      setNotice("Community controls saved.");
    } catch {
      setNotice("Community controls could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function setting(key: keyof Data["settings"], value: boolean) {
    setData((current) => current ? { ...current, settings: { ...current.settings, [key]: value } } : current);
  }

  async function moderate(id: string, status: "approved" | "hidden" | "spam") {
    if (!token) return;
    setBusy(true);
    try {
      await moderateJournalComment({ data: { accessToken: token, commentId: id, status } });
      await load(token);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/owner/journal" className="font-bold text-primary underline underline-offset-4">← Journal editor</Link>
        <p className="memo mt-8 text-coral">Owner controls</p>
        <h1 className="mt-2 font-slab text-5xl uppercase">Community front desk.</h1>
        <p className="mt-4 max-w-3xl">Everything is independently gated. Comments default OFF, supporter checkout defaults OFF, and digest sending defaults OFF.</p>
        {notice ? <p role="status" className="mt-4 rounded-xl border-2 border-foreground bg-paper p-4">{notice}</p> : null}

        {data ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo">Reader accounts</p><p className="mt-2 font-slab text-5xl">{data.memberCount}</p></div>
              <div className="rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo">Active supporters</p><p className="mt-2 font-slab text-5xl">{data.supporterCount}</p></div>
            </div>

            <form onSubmit={saveSettings} className="mt-8 rounded-3xl border-2 border-foreground bg-secondary p-6">
              <h2 className="font-display text-3xl font-semibold">Feature switches</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  ["commentsEnabled", "Comments / guestbook"],
                  ["supporterEnabled", "Optional $3/$5 supporter checkout"],
                  ["digestSendingEnabled", "Automatic digest sending"],
                  ["reactionsEnabled", "Article reactions"],
                  ["authorFollowsEnabled", "Author follows"],
                  ["accountSignupEnabled", "New reader accounts"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-foreground bg-background p-4">
                    <span className="font-bold">{label}</span>
                    <input type="checkbox" checked={Boolean(data.settings[key as keyof Data["settings"]])} onChange={(event) => setting(key as keyof Data["settings"], event.target.checked)} />
                  </label>
                ))}
              </div>
              <button disabled={busy} className="dark-button mt-5">{busy ? "Saving…" : "Save switches"}</button>
            </form>

            <section className="mt-8">
              <p className="memo text-primary">Moderation queue</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Comments at the front desk.</h2>
              <div className="mt-5 space-y-3">
                {data.comments.length ? data.comments.map((comment: any) => (
                  <article key={comment.id} className="rounded-2xl border-2 border-foreground bg-paper p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{comment.display_name_snapshot}</p>
                      <span className="memo text-coral">{comment.status}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{comment.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button disabled={busy} type="button" onClick={() => void moderate(comment.id, "approved")} className="secondary-button bg-background">Approve</button>
                      <button disabled={busy} type="button" onClick={() => void moderate(comment.id, "hidden")} className="secondary-button bg-background">Hide</button>
                      <button disabled={busy} type="button" onClick={() => void moderate(comment.id, "spam")} className="secondary-button bg-background">Spam</button>
                    </div>
                  </article>
                )) : <p className="rounded-2xl border-2 border-foreground bg-paper p-5">No comments in the queue.</p>}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
