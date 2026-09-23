import { createFileRoute } from "@tanstack/react-router";

import { BrandInfoPage } from "@/components/brand-info-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content: "How LOCKHABIT collects and uses order, site, analytics, and support information.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <BrandInfoPage
      eyebrow="Privacy policy"
      title="We sell soap. Not your secrets."
      intro="This policy explains the information LOCKHABIT uses to run the shop, take orders, improve the site, and answer the front desk."
      sections={[
        {
          title: "Information we collect",
          body: (
            <p>
              When you place an order, we may receive your name, email address, shipping and billing
              details, order contents, payment status, and related transaction information. If you
              contact support, we receive the information you choose to send us.
            </p>
          ),
        },
        {
          title: "Payments",
          body: (
            <p>
              Payments are processed through Stripe. LOCKHABIT does not need your full card number
              to run the shop. Stripe processes payment information under its own privacy and
              security practices.
            </p>
          ),
        },
        {
          title: "Site analytics",
          body: (
            <p>
              We use analytics and ordinary site technology to understand visits, pages viewed,
              device/browser information, and how the storefront performs. This helps us figure out
              what people actually use instead of consulting a coconut.
            </p>
          ),
        },
        {
          title: "How we use information",
          body: (
            <p>
              We use information to fulfill orders, send transactional messages, provide support,
              prevent fraud or abuse, maintain records, improve the storefront, and meet legal or
              financial obligations.
            </p>
          ),
        },
        {
          title: "Service providers",
          body: (
            <p>
              We may share only the information needed with providers that support payments,
              hosting, order storage, fulfillment, shipping, analytics, email delivery, and other
              shop operations. We do not sell personal information to advertisers.
            </p>
          ),
        },
        {
          title: "Your choices & contact",
          body: (
            <p>
              You can ask a privacy question or request access, correction, or deletion where
              applicable by emailing the front desk through our Contact page. Some records may need to be retained
              for transactions, fraud prevention, taxes, or other legal obligations.
            </p>
          ),
        },
      ]}
    />
  );
}
