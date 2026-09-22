import { createFileRoute } from "@tanstack/react-router";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content: "LOCKHABIT shipping rates, order tracking, address changes, and delivery details.",
      },
    ],
  }),
  component: Shipping,
});

function Shipping() {
  return (
    <BrandInfoPage
      eyebrow="Shipping policy"
      title="Your soap does have to leave the resort eventually."
      intro="Here is what happens between checkout and your bathroom shelf."
      sections={[
        {
          title: "Rates",
          body: (
            <>
              <p>Orders under $75 ship for a flat $7.95. Orders of $75 or more qualify for free shipping.</p>
              <p>
                Shipping destinations and any destination-specific availability shown at checkout
                are the source of truth.
              </p>
            </>
          ),
        },
        {
          title: "Processing & tracking",
          body: (
            <p>
              We send an order confirmation after successful payment. Tracking is emailed when it
              becomes available from the fulfillment or shipping carrier. Processing and delivery
              times vary by destination and carrier, so we do not promise a beach-chair-level exact
              arrival time.
            </p>
          ),
        },
        {
          title: "Address changes",
          body: (
            <p>
              Please check your shipping address before paying. If something is wrong, email
              oralrobinson21@outlook.com immediately. Once an order is already processing or in carrier
              hands, an address change may no longer be possible.
            </p>
          ),
        },
        {
          title: "International orders",
          body: (
            <p>
              If checkout offers delivery to your destination, local customs, duties, taxes, or
              carrier fees may still apply unless they were collected at checkout. Those charges
              are determined by local authorities or carriers.
            </p>
          ),
        },
        {
          title: "Lost, damaged, or incorrect packages",
          body: (
            <p>
              Email oralrobinson21@outlook.com with your order number and, for damaged or incorrect
              items, clear photos of the package and product. We’ll review the issue and work with
              you on the appropriate replacement or refund.
            </p>
          ),
        },
      ]}
    />
  );
}
