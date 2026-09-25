import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export const Route = createFileRoute("/creator/invite-preview")({
  head: () => ({
    meta: [
      { title: "Creator Invite Email · LOCKHABIT Design Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreatorInvitePreview,
});

function CreatorInvitePreview() {
  return (
    <main className="min-h-screen bg-[#efe8da] px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Creator onboarding email preview</p>
            <p className="text-sm text-muted-foreground">Design only · no real email is sent from this route.</p>
          </div>
          <Link to="/creator/login" className="secondary-button">Open sign-in page</Link>
        </div>

        <section className="overflow-hidden rounded-[1.6rem] border-2 border-foreground bg-paper shadow-[8px_8px_0_var(--color-foreground)]">
          <header className="border-b-2 border-foreground bg-background px-6 py-5">
            <img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" className="h-16 w-44 object-contain object-left mix-blend-multiply" />
          </header>

          <div className="bg-coral px-6 py-8 text-coral-foreground md:px-10">
            <p className="memo text-coral-foreground/75">You’re invited</p>
            <h1 className="mt-3 font-slab text-5xl uppercase leading-[.9] md:text-6xl">Your creator desk is ready.</h1>
            <p className="mt-5 max-w-xl">Track visits, attributed sales, pending commission, cash-out status, and your unique LockHabit referral tools in one place.</p>
          </div>

          <div className="px-6 py-8 md:px-10">
            <p className="font-display text-2xl font-semibold">Hi Jessica,</p>
            <p className="mt-4 leading-7 text-muted-foreground">
              LockHabit approved your creator account. Use the temporary password below once, then choose your own password before entering the dashboard.
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl border-2 border-foreground bg-sun/25 p-5 sm:grid-cols-2">
              <div>
                <p className="memo text-muted-foreground">Username</p>
                <p className="mt-2 font-black">jessica@example.com</p>
              </div>
              <div>
                <p className="memo text-muted-foreground">Temporary password</p>
                <p className="mt-2 font-black tracking-[.08em]">DEMO-ONLY-9472</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Production rule: this credential is one-time/temporary and must be replaced on first login. Do not store or resend the plaintext password afterward.
            </p>

            <Link to="/creator/set-password" className="dark-button mt-7 w-full justify-center sm:w-auto">
              <KeyRound size={17} /> Set my password <ArrowRight size={16} />
            </Link>

            <div className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
              <Feature icon={<Mail size={18} />} title="One onboarding email" text="Invite, username, first-login instructions." />
              <Feature icon={<ShieldCheck size={18} />} title="Password reset" text="Secure recovery path after setup." />
              <Feature icon={<KeyRound size={18} />} title="Normal sign-in" text="Username/email + password after first login." />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
