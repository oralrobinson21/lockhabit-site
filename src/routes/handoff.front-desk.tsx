import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CheckCircle2, Mail, MessageSquareText, ReceiptText } from "lucide-react";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/handoff/front-desk")({
  head: () => ({
    meta: [
      { title: "Front Desk Submitted State · LOCKHABIT UX Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FrontDeskSubmittedPreview,
});

function FrontDeskSubmittedPreview() {
  return (
    <BrandInfoPage
      eyebrow="The front desk"
      title="Message checked in."
      intro="This is the exact post-submit UX handoff state for the customer side. It is staging-only and does not send an email."
      sections={[
        {
          title: "What the customer sees",
          body: (
            <div className="grid gap-5">
              <div className="rounded-2xl border-2 border-foreground bg-secondary p-5 shadow-[4px_4px_0_var(--color-foreground)]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={22} />
                  <div>
                    <p className="font-display text-2xl font-semibold">Message checked in.</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The front desk will get back to you as soon as possible. If your note is about an order,
                      keep your order number handy so we can find your suitcase faster.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InfoCard icon={<Mail size={18} />} title="Reply path" body="A response goes to the email the customer submitted." />
                <InfoCard icon={<ReceiptText size={18} />} title="Order context" body="If an order number was entered, it stays attached to the support note." />
                <InfoCard icon={<MessageSquareText size={18} />} title="No dead end" body="The customer can go back to the shop or send another note without losing the LockHabit vibe." />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="primary-button">Open the real front desk form</Link>
                <Link to="/" className="secondary-button">Back to the lobby</Link>
              </div>
            </div>
          ),
        },
        {
          title: "What gets delivered internally",
          body: (
            <div className="rounded-2xl border-2 border-foreground bg-paper p-5">
              <p className="memo text-primary">Support email format · example only</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div><dt className="font-black">Subject</dt><dd className="text-muted-foreground">LOCKHABIT support · LH-000214 · Jordan</dd></div>
                <div><dt className="font-black">Reply-to</dt><dd className="text-muted-foreground">The customer’s submitted email</dd></div>
                <div><dt className="font-black">Body</dt><dd className="mt-1 whitespace-pre-line rounded-xl bg-muted p-3 text-muted-foreground">{"Name: Jordan\nEmail: jordan@example.com\nOrder: LH-000214\n\nMy tracking link has not updated in two days. Can you help?"}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Production already uses the front-desk contact server function and support inbox configuration; this route only previews the submitted state without sending anything.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 border-foreground bg-background p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-3 font-display text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
