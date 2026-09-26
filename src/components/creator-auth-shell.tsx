import { Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export function CreatorAuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  audience = "creator",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  audience?: "creator" | "team";
}) {
  return (
    <main className="min-h-screen bg-[#f7edd5] text-foreground">
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 lg:px-10">
          <Link to="/" className="brand-logo" aria-label="LOCKHABIT home">
            <img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] underline underline-offset-4">
            <ArrowLeft size={15} /> Back to store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center px-5 py-10 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[1.8rem] border-2 border-foreground bg-paper shadow-[9px_9px_0_var(--color-foreground)] lg:grid-cols-[.92fr_1.08fr]">
          <aside className="relative overflow-hidden bg-coral p-8 text-coral-foreground md:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sun/65" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-pool/25" aria-hidden="true" />
            <div className="relative">
              <p className="memo text-coral-foreground/80">{audience === "team" ? "LOCKHABIT · behind the front desk" : "LOCKHABIT creator desk"}</p>
              <h1 className="mt-5 font-slab text-[clamp(3rem,7vw,5.3rem)] uppercase leading-[.88]">
                {audience === "team" ? <>Good people.<br />Brighter days.</> : <>Good links.<br />Brighter days.</>}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-6">
                {audience === "team" ? "One place to check in. Your account opens the right desk after you sign in." : "Track visits, attributed sales, pending commission, available commission, payouts, and the exact referral tools assigned to you."}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {audience === "team" ? <>
                  <Perk icon={<Sparkles size={18} />} title="Your own desk" text="See the tools assigned to your account." />
                  <Perk icon={<ShieldCheck size={18} />} title="Private by design" text="Your sign-in determines what you can access." />
                  <Perk icon={<KeyRound size={18} />} title="Welcome back" text="Use the email and password you set up for LockHabit." />
                </> : <>
                  <Perk icon={<Sparkles size={18} />} title="Your referral link" text="One unique link tied to your creator account." />
                  <Perk icon={<ShieldCheck size={18} />} title="Protected earnings view" text="No customer card data or unnecessary private details." />
                  <Perk icon={<KeyRound size={18} />} title="Normal password login" text="Use the one-time invite to choose a password, then sign in normally." />
                </>}
              </div>
            </div>
          </aside>

          <div className="p-7 md:p-10 lg:p-12">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="font-display text-4xl font-semibold md:text-5xl">{title}</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 border-t border-border pt-5">{footer}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Perk({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border-2 border-coral-foreground/60 bg-coral-foreground/5 p-4">
      <div className="text-sun">{icon}</div>
      <p className="mt-2 font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-coral-foreground/80">{text}</p>
    </div>
  );
}
