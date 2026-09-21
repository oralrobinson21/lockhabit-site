import type Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sendOrderConfirmation,
  type OrderConfirmation,
} from "@/lib/order-confirmation-email.server";

type SupportedEvent =
  | "checkout.session.completed"
  | "checkout.session.async_payment_succeeded"
  | "checkout.session.async_payment_failed";

export type WebhookResult = "ignored" | "payment_pending" | "payment_failed" | "paid";

type PaidOrderRecord = {
  order_id: string;
  order_number: number;
};

export type WebhookDependencies = {
  retrieveSession: (id: string) => Promise<Stripe.Checkout.Session>;
  recordPaidOrder: (
    event: Stripe.Event,
    session: Stripe.Checkout.Session,
    order: Omit<OrderConfirmation, "orderNumber">,
  ) => Promise<PaidOrderRecord>;
  recordNonPaidEvent: (
    event: Stripe.Event,
    session: Stripe.Checkout.Session,
    outcome: "payment_pending" | "payment_failed",
  ) => Promise<void>;
  sendConfirmationIfPending: (
    order: Omit<OrderConfirmation, "orderNumber"> & PaidOrderRecord,
  ) => Promise<void>;
};

const supportedEvents = new Set<SupportedEvent>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

function checkoutOrder(session: Stripe.Checkout.Session): Omit<OrderConfirmation, "orderNumber"> {
  const email = session.customer_details?.email;
  if (!email) throw new Error("Paid Checkout Session is missing customer email");
  const shipping = session.collected_information?.shipping_details;
  const items =
    session.line_items?.data.map((item) => ({
      name: item.description ?? "LockHabit item",
      quantity: item.quantity ?? 1,
      amountTotal: item.amount_total ?? 0,
    })) ?? [];
  if (!items.length) throw new Error("Paid Checkout Session is missing line items");

  return {
    checkoutSessionId: session.id,
    customerEmail: email,
    customerName: shipping?.name ?? session.customer_details?.name ?? null,
    currency: session.currency ?? "usd",
    subtotal: session.amount_subtotal ?? 0,
    shipping: session.total_details?.amount_shipping ?? 0,
    tax: session.total_details?.amount_tax ?? 0,
    total: session.amount_total ?? 0,
    shippingAddress: shipping?.address
      ? (JSON.parse(JSON.stringify(shipping.address)) as Record<string, string | null>)
      : null,
    items,
  };
}

export async function processCheckoutWebhook(
  event: Stripe.Event,
  dependencies: WebhookDependencies,
): Promise<WebhookResult> {
  if (!supportedEvents.has(event.type as SupportedEvent)) return "ignored";
  const eventSession = event.data.object as Stripe.Checkout.Session;
  const session = await dependencies.retrieveSession(eventSession.id);

  if (event.type === "checkout.session.async_payment_failed") {
    await dependencies.recordNonPaidEvent(event, session, "payment_failed");
    return "payment_failed";
  }

  if (session.payment_status !== "paid") {
    await dependencies.recordNonPaidEvent(event, session, "payment_pending");
    return "payment_pending";
  }

  const order = checkoutOrder(session);
  const record = await dependencies.recordPaidOrder(event, session, order);
  await dependencies.sendConfirmationIfPending({ ...order, ...record });
  return "paid";
}

export function createWebhookDependencies(stripe: Stripe): WebhookDependencies {
  return {
    retrieveSession: (id) =>
      stripe.checkout.sessions.retrieve(id, {
        expand: ["line_items.data.price.product", "payment_intent"],
      }),
    recordPaidOrder: async (event, session, order) => {
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      const { data, error } = await supabaseAdmin.rpc("record_paid_checkout", {
        p_event_id: event.id,
        p_event_type: event.type,
        p_checkout_session_id: session.id,
        p_payment_intent_id: paymentIntentId,
        p_customer_email: order.customerEmail,
        p_customer_name: order.customerName,
        p_currency: order.currency,
        p_amount_subtotal: order.subtotal,
        p_amount_shipping: order.shipping,
        p_amount_tax: order.tax,
        p_amount_total: order.total,
        p_shipping_details: order.shippingAddress,
        p_items: order.items,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Order persistence returned no record");
      return row;
    },
    recordNonPaidEvent: async (event, session, outcome) => {
      const { error } = await supabaseAdmin.rpc("record_stripe_checkout_event", {
        p_event_id: event.id,
        p_event_type: event.type,
        p_checkout_session_id: session.id,
        p_outcome: outcome,
      });
      if (error) throw error;
    },
    sendConfirmationIfPending: async (order) => {
      const { data, error } = await supabaseAdmin.rpc("claim_order_confirmation", {
        p_checkout_session_id: order.checkoutSessionId,
      });
      if (error) throw error;
      if (!data?.length) return;

      try {
        const providerMessageId = await sendOrderConfirmation({
          ...order,
          orderNumber: order.order_number,
        });
        const { error: updateError } = await supabaseAdmin
          .from("order_confirmation_deliveries")
          .update({
            status: "sent",
            provider_message_id: providerMessageId,
            sent_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("checkout_session_id", order.checkoutSessionId);
        if (updateError) throw updateError;
        const { error: orderUpdateError } = await supabaseAdmin
          .from("orders")
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq("checkout_session_id", order.checkoutSessionId);
        if (orderUpdateError) throw orderUpdateError;
      } catch (error) {
        await supabaseAdmin
          .from("order_confirmation_deliveries")
          .update({
            status: "failed",
            last_error: error instanceof Error ? error.message.slice(0, 500) : "Email send failed",
          })
          .eq("checkout_session_id", order.checkoutSessionId);
        throw error;
      }
    },
  };
}
