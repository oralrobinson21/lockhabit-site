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
          title: "Analytics & advertising measurement",
          body: (
            <p>
              We may use analytics, cookies, pixels, and similar technologies to understand visits,
              pages viewed, device/browser information, ad performance, and how the storefront is
              used. When advertising tools such as Meta Pixel or Conversions API are enabled, those
              providers may receive event data such as page views, product views, cart activity,
              checkout activity, and purchases for measurement and campaign optimization.
            </p>
          ),
        },
        {
          title: "Creator referral links",
          body: (
            <p>
              If you visit through a LockHabit creator link, we save a first-party referral token
              and record the visit so we can recognize the creator who referred you. The token may
              remain for up to 30 days. Creators see their own visit and earnings totals, without
              customer card information or unnecessary customer details. Approved creators use
              account information to manage referral links and payout records.
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
              hosting, order storage, fulfillment, shipping, analytics, advertising measurement,
              email delivery, and other shop operations. LOCKHABIT does not sell personal
              information for money. Some privacy laws may treat certain advertising-related
              disclosures as a "sale" or "share" even when no money changes hands, so applicable
              opt-out rights will be honored where required.
            </p>
          ),
        },
        {
          title: "Your choices & contact",
          body: (
            <p>
              You can ask a privacy question or request access, correction, deletion, or an
              applicable advertising-data opt-out through our Contact page. Marketing emails include
              an unsubscribe option. Some records may need to be retained for transactions, fraud
              prevention, taxes, or other legal obligations.
            </p>
          ),
        },
      ]}
    />
  );
}
