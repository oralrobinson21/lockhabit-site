import { createFileRoute } from "@tanstack/react-router";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content: "LOCKHABIT return, refund, damaged-order, and personal-care product policy.",
      },
    ],
  }),
  component: Returns,
});

function Returns() {
  return (
    <BrandInfoPage
      eyebrow="Returns & refunds"
      title="No hard feelings. Just a little hygiene."
      intro="Personal-care products are personal, so our return rules are simple and deliberately not hidden behind twelve layers of tiny print."
      sections={[
        {
          title: "Unopened items",
          body: (
            <p>
              Contact us within 14 days of delivery if you want to return an unopened, unused item.
              We’ll provide return instructions before anything is sent back.
            </p>
          ),
        },
        {
          title: "Opened personal-care products",
          body: (
            <p>
              For hygiene reasons, opened or used soaps and body-care products are not returnable
              because of preference, scent choice, or change of mind.
            </p>
          ),
        },
        {
          title: "Damaged, defective, or incorrect",
          body: (
            <p>
              If we sent the wrong item or your order arrived damaged or defective, contact
              the front desk through our Contact page within 7 days of delivery with your order number and photos.
              We’ll review it and make the appropriate replacement or refund.
            </p>
          ),
        },
        {
          title: "Refunds",
          body: (
            <p>
              Approved refunds are sent back to the original payment method. Original shipping
              charges are generally non-refundable unless the return is the result of an incorrect,
              damaged, or defective order. Bank processing times are outside our control.
            </p>
          ),
        },
        {
          title: "Promotions",
          body: (
            <p>
              Refunds are based on the amount actually paid after discounts. Promotional items or
              discounts may be adjusted when a qualifying order is partially returned.
            </p>
          ),
        },
      ]}
    />
  );
}
