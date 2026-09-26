import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { getCheckoutStatus } from "@/lib/payments.functions";
import { trackMetaEventOnce } from "@/lib/meta-analytics";
import { buildGa4PurchasePayload, trackGa4PurchaseOnce } from "@/lib/ga4-purchase";
import { trackAffiliatePurchase } from "@/lib/ga4-growth";
import { useCart } from "@/lib/cart";
import {
  formatReturnMoney,
  mergePhase,
  normalizeReturnItems,
  phaseForResult,
  RETURN_POLL_DELAYS_MS,
  shouldPollAgain,
  type ReturnItem,
  type ReturnPhase,
} from "@/lib/checkout-return";

type CheckoutStatus = Awaited<ReturnType<typeof getCheckoutStatus>>;

const googleAdsPurchaseSendTo = "AW-18469044137/OFR-CNHI8IEdEKn_3OZE";
const adsTrackedCheckoutSessions = new Set<string>();

function trackGoogleAdsPurchaseOnce(
  sessionId: string,
  value: number,
  currency: string,
  transactionId: string,
) {
  if (adsTrackedCheckoutSessions.has(sessionId)) return;
  const storageKey = `lockhabit:google-ads-purchase:${sessionId}`;
  try {
    if (window.localStorage.getItem(storageKey)) {
      adsTrackedCheckoutSessions.add(sessionId);
      return;
    }
  } catch {
    // Storage may be unavailable; use in-memory deduplication.
  }

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  try {
    gtag("event", "conversion", {
      send_to: googleAdsPurchaseSendTo,
      value,
      currency,
      transaction_id: transactionId,
    });
  } catch {
    // Google Ads must never interrupt order confirmation.
    return;
  }
  adsTrackedCheckoutSessions.add(sessionId);

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
  const [status, setStatus] = useState<ReturnPhase>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("usd");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [creatorAttributed, setCreatorAttributed] = useState(false);
  const clearCartRef = useRef(clearCart);
  clearCartRef.current = clearCart;

  useEffect(() => {
    if (!sessionId) {
      setStatus("unpaid");
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let requestSeq = 0;
    let appliedSeq = 0;
    let paidHandled = false;
    let attempt = 0;

    const handlePaidOnce = (result: CheckoutStatus) => {
      if (paidHandled || !result.paid) return;
      paidHandled = true;
      clearCartRef.current();
      if ("creatorAttributed" in result && result.creatorAttributed) {
        trackAffiliatePurchase({
          livemode: Boolean("livemode" in result && result.livemode),
          valueCents: result.total ?? 0,
          currency: result.currency ?? "usd",
        });
      }
      // Only genuine paid storefront checkouts may train advertising conversions.
      // Stripe test-mode and manual live-mode test charges are intentionally excluded.
      if (!("marketingEligible" in result && result.marketingEligible)) return;
      const purchasePayload = buildGa4PurchasePayload({
        transactionId: result.paymentIntentId ?? sessionId,
        totalCents: result.total ?? 0,
        shippingCents: result.shippingTotal ?? 0,
        taxCents: result.taxTotal ?? 0,
        currency: result.currency ?? "usd",
        items: result.analyticsItems,
      });
      trackGa4PurchaseOnce(sessionId, purchasePayload);
      trackMetaEventOnce(`purchase:${sessionId}`, "Purchase", {
        value: purchasePayload.value,
        currency: purchasePayload.currency,
        content_ids: result.analyticsItems.map((item) =>
          item.productId !== undefined ? String(item.productId) : item.name,
        ),
        content_type: "product",
      });
      trackGoogleAdsPurchaseOnce(
        sessionId,
        purchasePayload.value,
        purchasePayload.currency,
        purchasePayload.transaction_id,
      );
    };

    const apply = (result: CheckoutStatus) => {
      const incoming = phaseForResult(result);
      setStatus((current) => mergePhase(current, incoming));
      if (!result.paid) return;
      // Paid details only ever fill in or improve; a partial answer never erases a fuller one.
      if ("email" in result && result.email) setEmail(result.email);
      if ("orderNumber" in result && result.orderNumber) setOrderNumber(result.orderNumber);
      if ("paymentIntentId" in result && result.paymentIntentId) setPaymentIntentId(result.paymentIntentId);
      if ("items" in result) {
        const next = normalizeReturnItems(result.items);
        if (next.length) setItems(next);
      }
      if ("total" in result && typeof result.total === "number") setTotal(result.total);
      if ("currency" in result && result.currency) setCurrency(result.currency);
      if ("confirmationSent" in result && result.confirmationSent) setConfirmationSent(true);
      if ("creatorAttributed" in result && result.creatorAttributed) setCreatorAttributed(true);
      handlePaidOnce(result);
    };

    const schedule = () => {
      if (cancelled) return;
      const delay = RETURN_POLL_DELAYS_MS[attempt];
      if (delay === undefined) {
        // Out of retries: say so plainly instead of leaving a spinner or a blank card.
        setStatus((current) => (current === "checking" ? "delayed" : current));
        return;
      }
      attempt += 1;
      timer = setTimeout(check, delay);
    };

    const check = () => {
      const seq = ++requestSeq;
      getCheckoutStatus({ data: { sessionId } })
        .then((result) => {
          if (cancelled || seq < appliedSeq) return;
          appliedSeq = seq;
          apply(result as CheckoutStatus);
          if (shouldPollAgain(result as CheckoutStatus)) schedule();
        })
        .catch(() => {
          if (cancelled) return;
          schedule();
        });
    };

    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-16">
        <div className="w-full max-w-xl border-2 border-foreground bg-card p-8 text-center shadow-xl sm:p-12">
        {status === "checking" || status === "processing" ? (
          <LoaderCircle className="mx-auto animate-spin text-primary" size={42} />
        ) : (
          <CheckCircle2 className="mx-auto text-primary" size={48} />
        )}
        <h1 className="mt-6 font-display text-4xl font-semibold">
          {status === "paid"
            ? "You’re checked in."
            : status === "checking"
              ? "Confirming your order…"
              : status === "processing"
                ? "Payment processing."
                : status === "delayed"
                  ? "Still confirming your order."
                  : "Payment not completed."}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {status === "paid"
            ? confirmationSent
              ? `Payment confirmed. We sent your order confirmation${email ? ` to ${email}` : ""}.`
              : orderNumber
                ? "Payment confirmed and your order is recorded. Save the order details below."
                : "Payment confirmed. Your order number will show here in a moment and in your confirmation email."
            : status === "unpaid"
              ? "Your bag has not been charged. You can return to the shop and try again."
              : status === "processing"
                ? "Your bank is still confirming the payment. We’ll email you as soon as it clears."
                : status === "delayed"
                  ? "This is taking longer than usual. If you finished paying, your order is safe and a confirmation email is on the way. Refresh this page in a minute to see the details."
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
                  {formatReturnMoney(total, currency)}
                </p>
              </div>
            </div>

            <div className="py-4">
              <p className="memo mb-3">YOUR ITEMS</p>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-4">
                    <span className="font-semibold">
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      {formatReturnMoney(item.amountTotal, currency)}
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

            {orderNumber ? (
              <div className="mt-5 rounded-xl border-2 border-foreground bg-sun/30 p-4">
                <p className="font-display text-xl font-semibold">Take 5% off your next order</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use order number{" "}
                  <span className="font-bold text-foreground">
                    LH-{String(orderNumber).padStart(6, "0")}
                  </span>{" "}
                  as your single-use returning-guest reward at checkout.
                </p>
                <button
                  type="button"
                  className="secondary-button mt-3"
                  onClick={() => {
                    const value = `LH-${String(orderNumber).padStart(6, "0")}`;
                    void navigator.clipboard?.writeText(value);
                  }}
                >
                  Copy order number
                </button>
              </div>
            ) : null}
            {creatorAttributed ? (
              <p className="mt-3 text-xs text-muted-foreground">
                A creator referral was attributed on this paid order.
              </p>
            ) : null}
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
