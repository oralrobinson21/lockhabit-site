import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { getCheckoutStatus } from "@/lib/payments.functions";
import { trackMetaEventOnce } from "@/lib/meta-analytics";
import { buildGa4PurchasePayload, trackGa4PurchaseOnce } from "@/lib/ga4-purchase";
import { useCart } from "@/lib/cart";

const googleAdsPurchaseSendTo = "AW-18469044137/OFR-CNHI8IEdEKn_30ZE";

function trackGoogleAdsPurchaseOnce(
  sessionId: string,
  value: number,
  currency: string,
  transactionId: string,
) {
  const storageKey = `lockhabit:google-ads-purchase:${sessionId}`;
  try {
    if (window.localStorage.getItem(storageKey)) return;
  } catch {
    // Tracking must never interrupt order confirmation if storage is unavailable.
  }

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  gtag("event", "conversion", {
    send_to: googleAdsPurchaseSendTo,
    value,
    currency,
    transaction_id: transactionId,
  });

  try {
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // The conversion has already been queued; storage failure is non-fatal.
  }
}

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } =>
    typeof search["session_id"] === "string" ? { session_id: search["session_id"] } : {},
  head: () => ({
    meta: [
      { title: "Order confirmation | LOCKHABIT" },
      { name: "description", content: "Confirmation for your LOCKHABIT soap order." },
      { property: "og:title", content: "Order confirmation | LOCKHABIT" },
      { property: "og:description", content: "Confirmation for your LOCKHABIT soap order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{ name: string; quantity: number; amountTotal: number }>>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("usd");
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("unpaid");
      return;
    }
    void getCheckoutStatus({ data: { sessionId } }).then((result) => {
      setStatus(result.paid ? "paid" : "unpaid");
      if ("email" in result) setEmail(result.email ?? null);
      if ("orderNumber" in result) setOrderNumber(result.orderNumber ?? null);
      if ("paymentIntentId" in result) setPaymentIntentId(result.paymentIntentId ?? null);
      if ("items" in result) setItems(result.items ?? []);
      if ("total" in result) setTotal(result.total ?? 0);
      if ("currency" in result) setCurrency(result.currency ?? "usd");
      if ("confirmationSent" in result) setConfirmationSent(Boolean(result.confirmationSent));
      if (result.paid) {
        clearCart();
        // Only genuine paid storefront checkouts may train advertising conversions.
        // Stripe test-mode and manual live-mode test charges are intentionally excluded.
        if (!("marketingEligible" in result && result.marketingEligible)) return;
        trackGa4PurchaseOnce(
          sessionId,
          buildGa4PurchasePayload({
            transactionId: result.paymentIntentId ?? sessionId,
            totalCents: result.total ?? 0,
            shippingCents: result.shippingTotal ?? 0,
            taxCents: result.taxTotal ?? 0,
            currency: result.currency ?? "usd",
            items: result.analyticsItems,
          }),
        );
        trackMetaEventOnce(`purchase:${sessionId}`, "Purchase", {
          value: "total" in result ? (result.total ?? 0) / 100 : 0,
          currency: ("currency" in result ? result.currency : "usd").toUpperCase(),
          content_ids:
            "items" in result
              ? (result.items ?? []).map((item) => item.name)
              : [],
          content_type: "product",
        });
        trackGoogleAdsPurchaseOnce(
          sessionId,
          "total" in result ? (result.total ?? 0) / 100 : 0,
          ("currency" in result ? result.currency : "usd").toUpperCase(),
          "paymentIntentId" in result && result.paymentIntentId
            ? result.paymentIntentId
            : sessionId,
        );
      }
    });
  }, [sessionId, clearCart]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-16">
        <div className="w-full max-w-xl border-2 border-foreground bg-card p-8 text-center shadow-xl sm:p-12">
        {status === "checking" ? (
          <LoaderCircle className="mx-auto animate-spin text-primary" size={42} />
        ) : (
          <CheckCircle2 className="mx-auto text-primary" size={48} />
        )}
        <h1 className="mt-6 font-display text-4xl font-semibold">
          {status === "paid"
            ? "Your soap is on the way."
            : status === "checking"
              ? "Confirming your order…"
              : "Payment not completed."}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {status === "paid"
            ? confirmationSent
              ? `Payment confirmed. We sent your order confirmation${email ? ` to ${email}` : ""}.`
              : "Payment confirmed and your order is recorded. Save the order details below."
            : status === "unpaid"
              ? "Your bag has not been charged. You can return to the shop and try again."
              : "Please keep this page open for a moment."}
        </p>

        {status === "paid" && (
          <div className="mt-8 border-2 border-foreground bg-background p-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/25 pb-4">
              <div>
                <p className="memo">ORDER NUMBER</p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {orderNumber ? `LH-${String(orderNumber).padStart(6, "0")}` : "Confirmed"}
                </p>
              </div>
              <div className="text-right">
                <p className="memo">TOTAL PAID</p>
                <p className="mt-1 text-lg font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency.toUpperCase(),
                  }).format(total / 100)}
                </p>
              </div>
            </div>

            <div className="py-4">
              <p className="memo mb-3">YOUR ITEMS</p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-4">
                    <span className="font-semibold">
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency.toUpperCase(),
                      }).format(item.amountTotal / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {paymentIntentId && (
              <div className="border-t border-foreground/25 pt-4">
                <p className="memo">PAYMENT REFERENCE</p>
                <p className="mt-1 break-all text-xs">{paymentIntentId}</p>
              </div>
            )}
          </div>
        )}

          <Link to="/" className="primary-button mt-8 inline-flex">
            Return to the soap shop
          </Link>
        </div>
      </section>
    </main>
  );
}
