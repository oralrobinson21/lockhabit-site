import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { getCheckoutStatus } from "@/lib/payments.functions";

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
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid">("checking");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("unpaid");
      return;
    }
    void getCheckoutStatus({ data: { sessionId } }).then((result) => {
      setStatus(result.paid ? "paid" : "unpaid");
      if ("email" in result) setEmail(result.email ?? null);
    });
  }, [sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16 text-foreground">
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
            ? `Stripe confirmed your payment${email ? ` for ${email}` : ""}. Your order confirmation is sent only after our secure payment webhook records the order.`
            : status === "unpaid"
              ? "Your bag has not been charged. You can return to the shop and try again."
              : "Please keep this page open for a moment."}
        </p>
        <Link to="/" className="primary-button mt-8 inline-flex">
          Return to the soap shop
        </Link>
      </div>
    </main>
  );
}
