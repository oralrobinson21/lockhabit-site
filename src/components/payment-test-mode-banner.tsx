import { resolveClientStripeConfig } from "@/lib/stripe-config";

export function PaymentTestModeBanner() {
  let mode: "test" | "live";
  try {
    mode = resolveClientStripeConfig({
      VITE_STRIPE_MODE: import.meta.env.PROD ? "live" : import.meta.env["VITE_STRIPE_MODE"],
      VITE_PAYMENTS_CLIENT_TOKEN: import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"],
      VITE_PAYMENTS_CLIENT_TOKEN_LIVE: import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN_LIVE"],
    }).mode;
  } catch {
    return (
      <div className="w-full border-b border-destructive bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Production checkout is not configured. Complete payment setup to accept real payments.
      </div>
    );
  }
  if (mode === "test") {
    return (
      <div className="w-full border-b border-foreground bg-secondary px-4 py-2 text-center text-sm font-semibold text-secondary-foreground">
        Payments in this preview are in test mode.
      </div>
    );
  }
  return null;
}
