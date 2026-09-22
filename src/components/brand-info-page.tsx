import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

export type BrandInfoSection = {
  title: string;
  body: ReactNode;
};

export function BrandInfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: BrandInfoSection[];
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <section className="grain border-b-2 border-foreground bg-secondary px-5 py-16 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="section-title mt-3 max-w-4xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">{intro}</p>
          <p className="memo mt-5 text-muted-foreground">
            Effective September 21, 2026 · Fine Print Dept.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-5">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className={`paper-card p-6 sm:p-8 ${index % 3 === 1 ? "bg-secondary" : index % 3 === 2 ? "bg-sun" : "bg-paper"}`}
            >
              <p className="memo text-primary">Desk note {String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body}
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-3 sm:flex-row">
          <Link to="/" className="primary-button justify-center">
            <ArrowLeft size={17} /> Back to the lobby
          </Link>
          <a href="mailto:oralrobinson21@outlook.com" className="secondary-button justify-center">
            Email the front desk <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <footer className="border-t-2 border-foreground bg-foreground px-5 py-8 text-background lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="memo text-background/60">© 2026 LOCKHABIT Soap Co.</p>
          <p className="memo text-background/60">Questions? oralrobinson21@outlook.com</p>
        </div>
      </footer>
    </main>
  );
}
