import { createFileRoute } from "@tanstack/react-router";

import {
  createStripeClient,
  getStripeEnvironment,
  getStripeWebhookSecret,
} from "@/lib/stripe.server";
import { createWebhookDependencies, processCheckoutWebhook } from "@/lib/stripe-webhook.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing Stripe signature", { status: 400 });

        const rawBody = await request.text();
        const stripe = createStripeClient(getStripeEnvironment());
        let event;
        try {
          event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
        } catch {
          return new Response("Invalid Stripe signature", { status: 400 });
        }

        try {
          const result = await processCheckoutWebhook(event, createWebhookDependencies(stripe));
          return Response.json({ received: true, result });
        } catch (error) {
          console.error(
            `[Stripe webhook] ${event.id} processing failed:`,
            error instanceof Error ? error.message : "unknown error",
          );
          return new Response("Webhook processing failed", { status: 500 });
        }
      },
    },
  },
});
