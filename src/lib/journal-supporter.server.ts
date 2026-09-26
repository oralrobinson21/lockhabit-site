/* eslint-disable @typescript-eslint/no-explicit-any */
import type Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type JournalSupportWebhookResult = "ignored" | "journal_support_updated";

function memberStatus(status: Stripe.Subscription.Status, deleted = false) {
  if (deleted) return "canceled";
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  if (status === "canceled" || status === "incomplete_expired" || status === "paused") return "canceled";
  return "none";
}

function safeTier(value: string | null | undefined) {
  return value === "supporter_3" || value === "supporter_5" ? value : "free";
}

export async function processJournalSupportWebhook(
  event: Stripe.Event,
  stripe: Stripe,
): Promise<JournalSupportWebhookResult> {
  const db = supabaseAdmin as any;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription" || session.metadata?.["journal_supporter"] !== "true") {
      return "ignored";
    }
    const userId = session.metadata?.["auth_user_id"];
    if (!userId) throw new Error("Journal supporter checkout is missing auth_user_id metadata.");

    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
    const amount = Number(session.metadata?.["amount_cents"] ?? 0) || null;
    const tier = safeTier(session.metadata?.["support_tier"]);
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    const { error } = await db
      .from("journal_members")
      .update({
        supporter_tier: tier,
        supporter_status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", userId);
    if (error) throw error;

    await db.from("journal_supporter_events").upsert(
      {
        auth_user_id: userId,
        stripe_event_id: event.id,
        stripe_checkout_session_id: session.id,
        stripe_subscription_id: subscriptionId,
        amount_cents: amount,
        tier,
        event_type: event.type,
      },
      { onConflict: "stripe_event_id" },
    );
    return "journal_support_updated";
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    if (subscription.metadata?.["journal_supporter"] !== "true") return "ignored";
    const userId = subscription.metadata?.["auth_user_id"];
    if (!userId) throw new Error("Journal supporter subscription is missing auth_user_id metadata.");

    const tier = safeTier(subscription.metadata?.["support_tier"]);
    const status = memberStatus(subscription.status, event.type === "customer.subscription.deleted");
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const { error } = await db
      .from("journal_members")
      .update({
        supporter_tier: status === "canceled" ? "free" : tier,
        supporter_status: status,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", userId);
    if (error) throw error;

    const amount = Number(subscription.metadata?.["amount_cents"] ?? 0) || null;
    await db.from("journal_supporter_events").upsert(
      {
        auth_user_id: userId,
        stripe_event_id: event.id,
        stripe_subscription_id: subscription.id,
        amount_cents: amount,
        tier,
        event_type: event.type,
      },
      { onConflict: "stripe_event_id" },
    );
    return "journal_support_updated";
  }

  return "ignored";
}
