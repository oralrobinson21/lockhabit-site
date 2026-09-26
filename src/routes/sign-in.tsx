import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { resolvePortalAccess } from "@/lib/portal-access.functions";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: SharedSignIn,
});

function SharedSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session?.access_token) return;
      try {
        const access = await resolvePortalAccess({
          data: { accessToken: data.session.access_token },
        });
        if (!active) return;
        if (access.destination === "owner") void navigate({ to: "/admin/orders", replace: true });
        if (access.destination === "creator") void navigate({ to: "/creator", replace: true });
        if (access.destination === "reader") void navigate({ to: "/account", replace: true });
      } catch {
        if (active) setNotice("Sign-in could not be verified. Please try again.");
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.session?.access_token) throw new Error("Invalid sign-in");
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setNotice("Please verify your email before signing in. Check your inbox for the link.");
        return;
      }
      const access = await resolvePortalAccess({ data: { accessToken: data.session.access_token } });
      if (access.destination === "owner") {
        void navigate({ to: "/admin/orders", replace: true });
      } else if (access.destination === "creator") {
        void navigate({ to: "/creator", replace: true });
      } else if (access.destination === "reader") {
        void navigate({ to: "/account", replace: true });
      } else {
        await supabase.auth.signOut();
        setNotice("This account does not have access yet. Check your details or contact the front desk.");
      }
    } catch {
      setNotice("We couldn't sign you in. Check your email and password, then try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CreatorAuthShell
      audience="team"
      eyebrow="The front desk"
      title="Welcome back."
      description="Sign in once and we’ll take you to your LockHabit desk — reader, creator, or owner."
      footer={
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/join" className="font-bold text-foreground underline underline-offset-4">
            Create a reader account
          </Link>
          . Need help?{" "}
          <Link to="/contact" className="font-bold text-foreground underline underline-offset-4">
            Ring the front desk
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={signIn}>
        <label className="block">
          <span className="memo">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40"
          />
        </label>
        <button disabled={busy} className="dark-button w-full justify-center">
          <LockKeyhole size={17} />
          {busy ? "Checking in…" : "Sign in"}
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
