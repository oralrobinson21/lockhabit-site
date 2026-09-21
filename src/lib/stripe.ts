import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { resolveClientStripeConfig } from "@/lib/stripe-config";

const config = () => resolveClientStripeConfig(import.meta.env);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(config().key);
  }
  return stripePromise;
}

export function getStripeEnvironment() {
  return config().mode;
}
