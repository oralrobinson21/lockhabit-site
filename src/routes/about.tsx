import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Flower2, Palmtree, Waves } from "lucide-react";

import daisyImage from "@/assets/people/daisy-ceo.png";
import oralImage from "@/assets/people/oral.png";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content:
          "A memo from LOCKHABIT management: why we opened a soap company instead, how the soap gets made, and the people behind it.",
      },
      { property: "og:title", content: "About Us | LOCKHABIT SOAP CO." },
      {
        property: "og:description",
        content: "Meet Daisy, Oral, and the management behind LOCKHABIT's botanical bars.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <section className="about-beach relative isolate overflow-hidden px-5 py-16 sm:py-24 lg:px-10">
        <div className="about-water -z-10" aria-hidden="true" />
        <div className="about-foam -z-10" aria-hidden="true" />
        <Palmtree
          className="absolute left-4 top-12 -z-10 h-28 w-28 -rotate-12 text-foreground/25 sm:left-10 sm:h-44 sm:w-44"
          strokeWidth={1.2}
          aria-hidden="true"
        />
        <Waves
          className="absolute right-5 top-24 -z-10 h-24 w-24 text-hero-foreground/35 sm:right-14 sm:h-40 sm:w-40"
          strokeWidth={1.2}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="memo inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-paper px-4 py-2 shadow-[3px_3px_0_var(--color-foreground)]"
          >
            <ArrowLeft size={14} /> Back to the lobby
          </Link>

          <article className="memo-sheet relative mx-auto mt-10 max-w-4xl border-2 border-foreground bg-paper px-6 py-12 shadow-[10px_12px_0_var(--color-foreground)] sm:px-12 sm:py-16 lg:px-20">
            <header className="border-b-2 border-foreground pb-10 text-center">
              <p className="memo text-primary">LOCKHABIT SOAP &amp; BODY CARE · INTERNAL MEMO</p>
              <h1 className="slab-title mt-5">WE OPENED A SOAP COMPANY INSTEAD</h1>
              <p className="mt-5 font-display text-2xl italic">A memo from The Management</p>
            </header>

            <div className="mx-auto mt-10 max-w-2xl text-lg leading-8">
              <p>
                Most soap is boring. It sits there, beige and unscented, doing the absolute minimum.
                We found that unacceptable.
              </p>
              <p className="mt-6">
                LOCKHABIT makes botanical bars with actual personalities — twelve of them, each with
                its own mood, scent, and strong opinions about your morning routine. Premium
                ingredients, beautiful labels, and copy written by people who refuse to take soap
                too seriously. (The soap itself, we take very seriously.)
              </p>
            </div>

            <section className="mx-auto mt-14 max-w-2xl border-y-2 border-foreground py-10">
              <p className="eyebrow">How the soap gets made</p>
              <p className="text-lg leading-8">
                We partnered with an experienced manufacturer who produces every LOCKHABIT bar to
                our standards — quality botanical ingredients, consistent quality, no shortcuts. We
                handle the fun part: the scents, the designs, the personality, and making sure your
                order shows up like a little vacation in a box.
              </p>
            </section>

            <section className="mt-14">
              <p className="eyebrow text-center">Meet the management</p>
              <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-8">
                <div>
                  <div className="portrait-tape relative rotate-[-1.5deg] border-2 border-foreground bg-background p-3 shadow-[5px_6px_0_var(--color-foreground)]">
                    <img
                      src={daisyImage}
                      alt="Daisy, LOCKHABIT Chief Executive Officer, wearing a crown of daisies"
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <Flower2
                      className="absolute -bottom-5 -right-4 h-12 w-12 rotate-12 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-8 text-lg leading-8">
                    <strong>Daisy 🌼 — Chief Executive Officer.</strong> Founder, visionary, and the
                    reason this company exists. Oversees all nap operations and morale. Has never
                    paid rent. Never will.
                  </p>
                </div>
                <div>
                  <div className="portrait-tape relative rotate-[1.5deg] border-2 border-foreground bg-background p-3 shadow-[5px_6px_0_var(--color-foreground)]">
                    <img
                      src={oralImage}
                      alt="Oral, LOCKHABIT Chief Operating Officer"
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <span className="memo absolute -bottom-4 -left-3 rotate-[-4deg] border-2 border-foreground bg-sun px-3 py-2">
                      Operations · apparently
                    </span>
                  </div>
                  <p className="mt-8 text-lg leading-8">
                    <strong>Oral — Chief Operating Officer.</strong> Handles the unglamorous stuff:
                    the spreadsheets, the shipping, the emails, the everything-else. Reports
                    directly to the CEO. The CEO does not read his reports.
                  </p>
                </div>
              </div>
            </section>

            <section className="mx-auto mt-16 max-w-2xl border-t-2 border-foreground pt-10">
              <p className="eyebrow">What we believe</p>
              <p className="text-lg leading-8">
                Premium doesn't have to be pretentious. A $35 bar of soap should feel like $35 — and
                make you laugh a little, too. Life's stressful enough. Your shower shouldn't be.
              </p>
              <p className="mt-8 font-display text-2xl italic">— The Management</p>
            </section>

            <p className="memo mt-14 border-t border-foreground/25 pt-7 text-center text-muted-foreground">
              About Us · filed somewhere near the beach
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
