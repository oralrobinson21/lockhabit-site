import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useMemo } from "react";

import { createCartCheckout } from "@/lib/payments.functions";
import { getStripe } from "@/lib/stripe";

export function StripeCartCheckout({
  items,
  subscribe,
}: {
  items: Array<{ productId: number; quantity: number }>;
  subscribe: boolean;
}) {
  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createCartCheckout({
          data: {
            items,
            subscribe,
            returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("Checkout could not be started.");
        return result.clientSecret;
      },
    }),
    [items, subscribe],
  );

  return (
    <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
