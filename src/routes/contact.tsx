import { createFileRoute } from "@tanstack/react-router";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content:
          "The LOCKHABIT front desk: order help, product questions, and responsible amounts of soap indecision.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <BrandInfoPage
      eyebrow="The front desk"
      title="The lobby bell is decorative. Email works better."
      intro="Need help with an order or stuck between two bars? Send us a note. A real support inbox is waiting on the other side."
      sections={[
        {
          title: "Order help",
          body: (
            <>
              <p>
                Email{" "}
                <a
                  className="font-bold text-primary underline"
                  href="mailto:support@lockhabit.com"
                >
                  support@lockhabit.com
                </a>
                .
              </p>
              <p>
                If you already ordered, include your LOCKHABIT order number so we can find your
                suitcase faster.
              </p>
            </>
          ),
        },
        {
          title: "Scent indecision",
          body: (
            <p>
              Tell us what you usually like — fresh, warm, herbal, floral, clean, “anything except
              lavender” — and we’ll point you toward the right shelf.
            </p>
          ),
        },
        {
          title: "Response time",
          body: (
            <p>
              We answer as soon as we can. The front desk is digital, so there is no need to ring
              the bell repeatedly. We still respect the enthusiasm.
            </p>
          ),
        },
      ]}
    />
  );
}
