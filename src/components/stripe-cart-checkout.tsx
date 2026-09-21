import { useEffect, useState } from "react";

import { createCartCheckout } from "@/lib/payments.functions";

export function StripeCartCheckout({
  items,
  subscribe,
}: {
  items: Array<{ productId: number; quantity: number }>;
  subscribe: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await createCartCheckout({
          data: {
            items,
            subscribe,
            returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          },
        });

        if ("error" in result) throw new Error(result.error);
        if (!result.url) throw new Error("Checkout could not be started.");
        if (!cancelled) window.location.assign(result.url);
      } catch (checkoutError) {
        if (!cancelled) {
          setError(
            checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, subscribe]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl font-semibold">Checkout needs another try.</p>
        <p className="mt-3 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl font-semibold">Opening secure Stripe checkout…</p>
      <p className="mt-3 text-sm text-muted-foreground">
        You’ll continue on Stripe’s secure payment page.
      </p>
    </div>
  );
}
