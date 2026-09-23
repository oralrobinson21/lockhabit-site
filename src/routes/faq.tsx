import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { IslandFooter } from "@/components/island-footer";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | LOCKHABIT Soap Co." },
      {
        name: "description",
        content: "Answers about LOCKHABIT soap, bundle pricing, shipping and returns.",
      },
    ],
  }),
  component: FaqPage,
});

const questions = [
  {
    question: "Can I choose my own bundle?",
    answer: "Yes. Any three soap bars in your bag qualify for the $89 bundle price, and any six soap bars qualify for the $169 bundle price. Your bag recalculates automatically if you change quantities.",
  },
  {
    question: "Are orders one-time or recurring?",
    answer: "All orders are currently one-time purchases. We do not offer a monthly subscription or recurring checkout.",
  },
  {
    question: "How much is shipping?",
    answer: "Orders under $75 have a $7.95 flat shipping charge; orders of $75 or more qualify for free shipping. Your checkout shows eligible destinations and the final shipping amount.",
  },
  {
    question: "When should I expect my order?",
    answer: "Our published estimate for typical U.S. orders is 2–5 business days for fulfillment plus about 2–4 business days in transit. These are estimates, not guaranteed delivery dates; please see the Shipping page for details.",
  },
  {
    question: "Where can I see ingredients and how to use a bar?",
    answer: "Each product page includes its ingredient list, net weight, suggested use and any warnings. Check the specific bar before purchasing.",
  },
  {
    question: "What if I need a return or my order arrives damaged?",
    answer: "See our Returns & Refunds page for the current timelines and conditions. If your package is damaged or incorrect, contact us with your order number and photos.",
  },
] as const;

function FaqPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-20 lg:px-10">
        <nav aria-label="Breadcrumb" className="memo mb-8 text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">Home</Link> / FAQ
        </nav>
        <p className="eyebrow">The front desk</p>
        <h1 className="section-title">Good questions.<br /><em>Clear answers.</em></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Here is what to know before checking out. For details about an individual bar, visit its product page.
        </p>
        <div className="mt-10 grid gap-4">
          {questions.map(({ question, answer }) => (
            <details key={question} className="paper-card p-5 sm:p-6">
              <summary className="cursor-pointer font-display text-xl font-semibold">{question}</summary>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-5 text-sm font-bold">
          <Link to="/shipping" className="underline underline-offset-4">Shipping details</Link>
          <Link to="/returns" className="underline underline-offset-4">Returns & refunds</Link>
          <Link to="/contact" className="underline underline-offset-4">Contact us</Link>
        </div>
      </section>
      <IslandFooter />
    </main>
  );
}
