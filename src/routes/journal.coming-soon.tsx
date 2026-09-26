import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, Sparkles } from "lucide-react";

import { IslandFooter } from "@/components/island-footer";
import { SiteHeader } from "@/components/site-header";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";
import heroImage from "@/assets/lockhabit-hero.jpg";

export const Route = createFileRoute("/journal/coming-soon")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Journal · Coming Soon" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JournalComingSoon,
});

export function JournalComingSoon() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden border-b-2 border-foreground bg-[#f5e5bd] px-5 py-16 lg:px-10 lg:py-24">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[#f5e5bd]/75" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <p className="memo text-coral">Keep the Vibes Going · Journal foundation</p>
            <p className="memo mt-4 inline-block rounded-full border-2 border-foreground bg-sun px-4 py-2">Coming soon</p>
            <h1 className="mt-4 font-slab text-[clamp(3.4rem,9vw,7.4rem)] uppercase leading-[.86]">
              <span className="text-coral">Stories are</span>
              <br />
              <span className="text-[#173c2d]">checking in.</span>
            </h1>
            <p className="mt-6 max-w-xl font-display text-xl leading-relaxed">
              We’re building a place for ingredient stories, research notes, routines, source links,
              and the occasional sunny detour.
            </p>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The Journal opens when real articles and references are ready.
            </p>
            <Link to="/" className="primary-button mt-7">
              <ArrowLeft size={16} /> Back to LockHabit
            </Link>
          </div>
          <div className="relative min-h-[420px]">
            <div className="absolute left-[8%] top-[8%] w-[78%] rotate-[-3deg] rounded-[1.5rem] border-2 border-foreground bg-paper p-7 shadow-[8px_8px_0_var(--color-foreground)]">
              <div className="flex items-center justify-between border-b border-foreground/20 pb-4">
                <img
                  src={logoTransparent}
                  alt="LOCKHABIT"
                  className="h-14 w-36 object-contain object-left mix-blend-multiply"
                />
                <Sparkles className="text-coral" />
              </div>
              <p className="memo mt-5 text-primary">Front desk note</p>
              <h2 className="mt-3 font-display text-4xl font-semibold">
                Journal entries on the horizon.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Real research. Real references. Mixed results included when they exist. No miracle
                copy.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-full border-2 border-foreground bg-muted px-4 py-3">
                <Search size={18} />
                <span className="text-sm text-muted-foreground">
                  Search appears when articles arrive
                </span>
              </div>
              <p className="memo mt-6 text-coral">Good ingredients · brighter days</p>
            </div>
          </div>
        </div>
      </section>
      <IslandFooter />
    </main>
  );
}
