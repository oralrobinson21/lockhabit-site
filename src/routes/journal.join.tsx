import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/journal/join")({
  head: () => ({
    meta: [
      { title: "Reader Check-In · LOCKHABIT Journal" },
      { name: "description", content: "Create a free LOCKHABIT reader account for the Morning Shower, saved stories, community features, and a lifetime 10% member benefit." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JournalJoin,
});

function JournalJoin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void navigate({ to: "/journal/account", replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const redirectTo = window.location.origin + "/journal/account";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setNotice("We could not send the check-in link. Please try again.");
      return;
    }
    setNotice("Check your email. Your one-time reader check-in link is on the way.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden border-b-2 border-foreground bg-[#f5e5bd] px-5 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="memo text-coral">Reader check-in · no velvet rope</p>
            <h1 className="mt-4 max-w-3xl font-slab text-[clamp(3.3rem,8vw,7rem)] uppercase leading-[.88]">
              Free account.<br /><span className="text-coral">Better mornings.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-display text-xl leading-relaxed">
              Save stories, choose your Morning Shower rhythm, react when something is useful (or ridiculous), and get a lifetime 10% LOCKHABIT member benefit.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
              The 10% member benefit is the same canonical 10% offer as Check-In — it does not stack with itself into 20%.
            </p>
          </div>

          <div className="rotate-[-1deg] rounded-3xl border-2 border-foreground bg-paper p-6 shadow-[8px_8px_0_var(--color-foreground)] sm:p-8">
            <div className="flex items-center gap-3"><Sparkles className="text-coral" /><p className="memo">The Morning Shower</p></div>
            <h2 className="mt-3 font-display text-3xl font-semibold">Five minutes of useful nonsense for a better day.</h2>
            <ul className="mt-5 space-y-2 text-sm leading-6">
              <li>☀ One thing worth knowing</li>
              <li>🧼 One body/skin idea</li>
              <li>🌿 One ingredient we are investigating</li>
              <li>😂 One ridiculous thing from the internet</li>
              <li>🏖 One thing that may improve the day</li>
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">Default: one digest a day at most, with up to five meaningful items. If nothing is worth sending, we would rather send nothing.</p>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="memo">Email</span>
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40" placeholder="you@example.com" />
              </label>
              <button disabled={busy} className="dark-button w-full justify-center"><Mail size={17} />{busy ? "Sending…" : "Email me a one-time check-in link"}</button>
              {notice ? <p role="status" className="text-sm">{notice}</p> : null}
            </form>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Editorial access stays free. Optional $3/$5 support exists separately and never unlocks required content.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-10">
        <p className="text-sm leading-7">Already checked in? <Link to="/journal/account" className="font-bold text-primary underline underline-offset-4">Open your reader desk</Link>.</p>
      </section>
      <IslandFooter />
    </main>
  );
}
