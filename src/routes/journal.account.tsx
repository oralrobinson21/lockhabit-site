/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, LogOut, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import {
  createJournalSupportCheckout,
  ensureJournalMember,
  getJournalAccount,
  saveJournalPreferences,
} from "@/lib/journal-community.functions";

type Account = Awaited<ReturnType<typeof getJournalAccount>>;

export const Route = createFileRoute("/journal/account")({
  head: () => ({
    meta: [
      { title: "My Reader Desk · LOCKHABIT Journal" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: JournalAccount,
});

const categories = ["Bathhouse", "Sleep Desk", "Ingredients", "We Tried It", "Good Stuff", "Travel Brain"];

function JournalAccount() {
  const [accessToken, setAccessToken] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [frequency, setFrequency] = useState<"daily_digest" | "important_only" | "weekly" | "off">("daily_digest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [readSpeed, setReadSpeed] = useState<1 | 1.5 | 2>(1);
  const [commentsOptIn, setCommentsOptIn] = useState(true);
  const [notice, setNotice] = useState("Checking your room key…");
  const [busy, setBusy] = useState(false);

  async function load(token: string) {
    try {
      const ensured = await ensureJournalMember({ data: { accessToken: token } });
      const next = await getJournalAccount({ data: { accessToken: token } });
      setAccount(next);
      const member = next.member ?? ensured.member;
      setDisplayName(member?.display_name ?? "");
      setFrequency((member?.newsletter_frequency ?? "daily_digest") as typeof frequency);
      setSelectedCategories(Array.isArray(member?.newsletter_categories) ? member.newsletter_categories : []);
      setReadSpeed(Number(member?.read_speed ?? 1) as 1 | 1.5 | 2);
      setCommentsOptIn(member?.comments_opt_in !== false);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your reader desk could not be loaded.");
    }
  }

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const token = data.session?.access_token ?? "";
      setAccessToken(token);
      if (token) void load(token);
      else setNotice("You are not checked in yet.");
    });
    return () => { active = false; };
  }, []);

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    try {
      await saveJournalPreferences({
        data: {
          accessToken,
          displayName,
          frequency,
          categories: selectedCategories,
          readSpeed,
          commentsOptIn,
        },
      });
      await load(accessToken);
      setNotice("Your reader desk is updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Preferences could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function support(amountCents: 300 | 500) {
    if (!accessToken) return;
    setBusy(true);
    try {
      const result = await createJournalSupportCheckout({
        data: { accessToken, amountCents, returnUrl: window.location.href },
      });
      if (result.url) window.location.assign(result.url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Support checkout is not available yet.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/journal");
  }

  if (!accessToken) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="memo text-coral">Reader desk</p>
          <h1 className="mt-3 font-slab text-5xl uppercase">Your room key is missing.</h1>
          <p className="mt-5">{notice}</p>
          <Link to="/journal/join" className="dark-button mt-7">Free reader check-in</Link>
        </section>
        <IslandFooter />
      </main>
    );
  }

  const member = account?.member as any;
  const supporterActive = member?.supporter_status === "active";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <header className="border-b-2 border-foreground bg-[#f5e5bd] px-5 py-12 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="memo text-coral">Your reader desk</p>
          <h1 className="mt-3 font-slab text-[clamp(3rem,7vw,6rem)] uppercase leading-[.9]">Good habits.<br />Your settings.</h1>
          <p className="mt-5 max-w-2xl font-display text-xl">Free account, free editorial, and a lifetime 10% member benefit. The rest is just choosing how often you want us in your inbox.</p>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_.75fr] lg:px-10">
        <form onSubmit={save} className="rounded-3xl border-2 border-foreground bg-paper p-6 shadow-[6px_6px_0_var(--color-foreground)]">
          <p className="memo text-primary">Preferences</p>
          <label className="mt-5 block">
            <span className="font-bold">Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="Resort Guest" />
          </label>

          <fieldset className="mt-6">
            <legend className="font-bold">How often should The Morning Shower arrive?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["daily_digest", "Daily digest · at most once/day"],
                ["important_only", "Important only"],
                ["weekly", "Weekly"],
                ["off", "No newsletter"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-background p-3">
                  <input type="radio" name="frequency" checked={frequency === value} onChange={() => setFrequency(value as typeof frequency)} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-bold">Topics you want more of</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <label key={category} className={"cursor-pointer rounded-full border-2 border-foreground px-3 py-2 text-sm font-bold " + (selectedCategories.includes(category) ? "bg-sun" : "bg-background")}>
                  <input className="sr-only" type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-bold">Default read-aloud speed</legend>
            <div className="mt-3 flex gap-2">
              {([1, 1.5, 2] as const).map((value) => (
                <label key={value} className={"cursor-pointer rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold " + (readSpeed === value ? "bg-sun" : "bg-background")}>
                  <input className="sr-only" type="radio" name="speed" checked={readSpeed === value} onChange={() => setReadSpeed(value)} />
                  {value === 1 ? "1× Normal" : value + "×"}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-foreground bg-secondary p-4">
            <input type="checkbox" checked={commentsOptIn} onChange={(event) => setCommentsOptIn(event.target.checked)} className="mt-1" />
            <span><strong>Let me join comments when the guestbook opens.</strong><span className="mt-1 block text-sm text-muted-foreground">Comments are built but globally closed for now.</span></span>
          </label>

          <button disabled={busy} className="dark-button mt-6"><Save size={17} />{busy ? "Saving…" : "Save my desk"}</button>
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border-2 border-foreground bg-sun/40 p-6">
            <p className="memo">Member benefit</p>
            <p className="mt-2 font-slab text-5xl">10% OFF</p>
            <p className="mt-3 text-sm leading-6">For life while the program exists. This is the same canonical 10% benefit as Check-In, so it never double-stacks into 20%.</p>
          </section>

          <section className="rounded-3xl border-2 border-foreground bg-secondary p-6">
            <HeartHandshake className="text-coral" />
            <p className="memo mt-3 text-coral">Optional support</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">{supporterActive ? "You are helping keep the imaginary pool warm." : "You really do not have to pay us."}</h2>
            <p className="mt-3 text-sm leading-6">Everything in the Journal stays free. If you feel like helping with research, writers, photos, and keeping the lights on, you can toss in a few bucks a month.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" disabled={busy || !account?.settings.supporterEnabled} onClick={() => void support(300)} className="dark-button">$3/month</button>
              <button type="button" disabled={busy || !account?.settings.supporterEnabled} onClick={() => void support(500)} className="secondary-button bg-background">$5/month</button>
            </div>
            {!account?.settings.supporterEnabled ? <p className="mt-3 text-xs text-muted-foreground">The subscription plumbing is installed but checkout is intentionally OFF until Stripe TEST verification is complete.</p> : null}
          </section>

          <button type="button" onClick={() => void signOut()} className="secondary-button bg-background"><LogOut size={16} /> Sign out</button>
        </div>
      </section>
      {notice ? <p role="status" className="mx-auto max-w-6xl px-5 pb-8 text-sm font-medium lg:px-10">{notice}</p> : null}
      <IslandFooter />
    </main>
  );
}
