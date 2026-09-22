import { createFileRoute } from "@tanstack/react-router";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content: "Terms for shopping, promotions, products, payments, and use of the LOCKHABIT website.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <BrandInfoPage
      eyebrow="Terms of service"
      title="The serious page, wearing a vacation shirt."
      intro="By using lockhabit.com or placing an order, you agree to these terms. We kept them readable on purpose."
      sections={[
        {
          title: "Shopping & payment",
          body: (
            <p>
              Prices, discounts, taxes, shipping charges, and the final order total are shown during
              checkout. An order is accepted after successful payment and confirmation. We may
              cancel or refund an order when required for fraud prevention, pricing mistakes,
              inventory or fulfillment problems, or legal reasons.
            </p>
          ),
        },
        {
          title: "Promotions",
          body: (
            <p>
              Discounts and promotional gifts are subject to their displayed terms, eligibility,
              and availability. Promotions may not combine unless the storefront specifically says
              they do. We may correct an obvious promotion or pricing error before fulfillment.
            </p>
          ),
        },
        {
          title: "Product information",
          body: (
            <p>
              We work to keep product descriptions, ingredients, weights, images, and usage
              information accurate. Packaging, appearance, scent, and color may vary slightly.
              Always read the product label and discontinue use if irritation occurs.
            </p>
          ),
        },
        {
          title: "Personal use",
          body: (
            <p>
              LOCKHABIT products are sold for ordinary personal-care use unless otherwise stated.
              Site content is general product information and is not medical advice.
            </p>
          ),
        },
        {
          title: "Website & brand",
          body: (
            <p>
              LOCKHABIT names, logos, artwork, product photography, copy, and site design may not be
              copied or commercially reused without permission. Browsing the resort is encouraged.
              Rebuilding the resort elsewhere is not.
            </p>
          ),
        },
        {
          title: "Availability & liability",
          body: (
            <p>
              We may update or temporarily interrupt the site. To the extent permitted by law,
              LOCKHABIT is not responsible for indirect losses or events outside reasonable
              control, including carrier delays or third-party service outages. Rights that cannot
              legally be limited remain unaffected.
            </p>
          ),
        },
        {
          title: "Governing law & contact",
          body: (
            <p>
              These terms are governed by applicable New York law, without limiting consumer rights
              that apply in your location. Questions can be sent to oralrobinson21@outlook.com.
            </p>
          ),
        },
      ]}
    />
  );
}
