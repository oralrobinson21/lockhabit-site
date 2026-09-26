import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { ensureReaderProfile } from "@/lib/reader-account.functions";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JoinReader,
});

function JoinReader() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const redirectTo = `${window.location.origin}/sign-in`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { lockhabit_role: "reader" },
        },
      });
      if (error) throw error;
      if (data.session?.access_token) {
        await ensureReaderProfile({
          data: {
            accessToken: data.session.access_token,
            newsletterOptIn,
          },
        });
        void navigate({ to: "/account", replace: true });
        return;
      }
      setNotice(
        "Check your email to verify your account, then sign in. Until then, comments stay locked.",
      );
    } catch {
      setNotice("We couldn’t create that account. Try a different email or sign in instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CreatorAuthShell
      audience="team"
      eyebrow="Journal guest list"
      title="Create a reader account."
      description="Optional sign-up for Journal comments and account preferences. Creators and owners keep their own desks."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-bold text-foreground underline underline-offset-4">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={join}>
        <label className="block">
          <span className="memo">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40"
          />
        </label>
        <label className="block">
          <span className="memo">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40"
          />
        </label>
        <label className="flex items-start gap-3 text-left text-sm">
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={(event) => setNewsletterOptIn(event.target.checked)}
            className="mt-1"
          />
          <span>
            Email me LockHabit postcards (new bars, restocks, occasional offers). Explicit opt-in
            only — unsubscribe anytime.
          </span>
        </label>
        <button disabled={busy} className="dark-button w-full justify-center">
          {busy ? "Creating…" : "Create reader account"}
        </button>
        {notice ? (
          <p role="status" className="text-sm">
            {notice}
          </p>
        ) : null}
      </form>
    </CreatorAuthShell>
  );
}
