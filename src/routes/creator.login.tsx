import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";

export const Route = createFileRoute("/creator/login")({
  head: () => ({
    meta: [
      { title: "Creator Sign In · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreatorLogin,
});

function CreatorLogin() {
  return (
    <CreatorAuthShell
      eyebrow="Creator sign in"
      title="Welcome back."
      description="Sign in to see traffic, attributed sales, commission status, payout history, and your LockHabit referral tools."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">First time here?</span>
          <Link to="/creator/set-password" className="font-black underline underline-offset-4">Set your password</Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="creator-email" className="memo block">Email or username</label>
          <input id="creator-email" autoComplete="username" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40" placeholder="creator@example.com" />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="creator-password" className="memo">Password</label>
            <Link to="/creator/forgot-password" className="text-xs font-black underline underline-offset-4">Forgot password?</Link>
          </div>
          <input id="creator-password" type="password" autoComplete="current-password" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-sun/40" placeholder="••••••••••••" />
        </div>
        <button className="dark-button w-full justify-center"><LockKeyhole size={17} /> Sign in</button>
      </form>
    </CreatorAuthShell>
  );
}
