import { useEffect, useState } from "react";

import { createCartCheckout } from "@/lib/payments.functions";
import { trackMetaEventOnce } from "@/lib/meta-analytics";

export function StripeCartCheckout({
  items,
}: {
  items: Array<{ productId: number; quantity: number }>;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const checkoutKey = `once:${items
          .map((item) => `${item.productId}x${item.quantity}`)
          .join(",")}`;
        trackMetaEventOnce(checkoutKey, "InitiateCheckout", {
          content_ids: items.map((item) => String(item.productId)),
          content_type: "product",
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
          currency: "USD",
        });

        const result = await createCartCheckout({
          data: {
            items,
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
  }, [items]);

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
