/* eslint-disable @typescript-eslint/no-explicit-any -- temporary until generated Supabase types include PR #23 migrations */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/creator/login")({
  head: () => ({ meta: [{ title: "Creator Sign In · LOCKHABIT" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: CreatorLogin,
});

function CreatorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setNotice("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) {
      setNotice("Email or password is incorrect, or this creator account is not ready yet.");
      setBusy(false); return;
    }
    const { data: profile } = await (supabase as any).from("creator_profiles").select("status").eq("auth_user_id", data.user.id).maybeSingle();
    if (!profile || !["approved", "active"].includes(profile.status)) {
      await supabase.auth.signOut();
      setNotice("This account does not have active creator access.");
      setBusy(false); return;
    }
    void navigate({ to: "/creator" });
  }

  return <CreatorAuthShell eyebrow="Creator sign in" title="Welcome back."
    description="Sign in to see traffic, attributed sales, commission status, payout history, and your LockHabit referral tools."
    footer={<div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">Need access?</span><Link to="/creator/forgot-password" className="font-black underline underline-offset-4">Reset password</Link></div>}>
    <form className="space-y-5" onSubmit={signIn}>
      <div><label htmlFor="creator-email" className="memo block">Creator email</label><input id="creator-email" type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40" placeholder="creator@example.com" /></div>
      <div><div className="flex items-center justify-between gap-3"><label htmlFor="creator-password" className="memo">Password</label><Link to="/creator/forgot-password" className="text-xs font-black underline underline-offset-4">Forgot password?</Link></div><input id="creator-password" type="password" required minLength={12} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40" /></div>
      <button disabled={busy} className="dark-button w-full justify-center"><LockKeyhole size={17} /> {busy ? "Signing in…" : "Sign in"}</button>
      {notice ? <p role="status" className="text-sm">{notice}</p> : null}
    </form>
  </CreatorAuthShell>;
}
