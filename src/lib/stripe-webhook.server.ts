import type Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  commissionAvailableAt,
  commissionCents,
} from "@/lib/checkout-discounts";
import {
  sendOrderConfirmation,
  type OrderConfirmation,
} from "@/lib/order-confirmation-email.server";
import { parseSelectedProductIds, summarizeSelectedProducts } from "@/lib/product-selection";

type CheckoutSupportedEvent =
  | "checkout.session.completed"
  | "checkout.session.async_payment_succeeded"
  | "checkout.session.async_payment_failed"
  | "checkout.session.expired";

type RefundSupportedEvent = "charge.refunded" | "refund.created" | "refund.updated";

export type WebhookResult =
  | "ignored"
  | "payment_pending"
  | "payment_failed"
  | "paid"
  | "expired"
  | "refund_adjusted";

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
    outcome: "payment_pending" | "payment_failed" | "expired",
  ) => Promise<void>;
  sendConfirmationIfPending: (
    order: Omit<OrderConfirmation, "orderNumber"> & PaidOrderRecord,
  ) => Promise<void>;
  finalizePaidGrowth?: (
    event: Stripe.Event,
    session: Stripe.Checkout.Session,
    record: PaidOrderRecord,
  ) => Promise<void>;
  releaseReservedReward?: (checkoutSessionId: string) => Promise<void>;
  applyRefundAdjustment?: (event: Stripe.Event) => Promise<"ignored" | "refund_adjusted">;
};

const checkoutEvents = new Set<CheckoutSupportedEvent>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

const refundEvents = new Set<RefundSupportedEvent>([
  "charge.refunded",
  "refund.created",
  "refund.updated",
]);

const BODY_CARE_PRODUCT_ID = 11;

/** Promotion code the customer typed at checkout (requires `discounts.promotion_code` expanded). */
function appliedDiscountCode(session: Stripe.Checkout.Session): string | null {
  const lockhabitLabels = session.metadata?.["discount_labels"]?.trim();
  if (lockhabitLabels) return lockhabitLabels;
  for (const discount of session.discounts ?? []) {
    const promotion = discount.promotion_code;
    if (promotion && typeof promotion === "object" && promotion.code) return promotion.code;
    const coupon = discount.coupon;
    if (coupon && typeof coupon === "object" && coupon.name) return coupon.name;
  }
  return null;
}

function describeOrderKind(session: Stripe.Checkout.Session, selectedProductIds: number[]): string {
  const soapCount = selectedProductIds.filter((id) => id !== BODY_CARE_PRODUCT_ID).length;
  const monthly = session.metadata?.["delivery"] === "monthly" || session.mode === "subscription";
  if (soapCount === 3) return monthly ? "3-Bar Monthly Bundle" : "3-Bar Bundle";
  if (soapCount === 6) return monthly ? "6-Bar Monthly Bundle" : "6-Bar Bundle";
  if (monthly) return "Monthly Delivery";
  return "Order";
}

function checkoutOrder(
  session: Stripe.Checkout.Session,
  paidAtUnixSeconds: number | null,
): Omit<OrderConfirmation, "orderNumber"> {
  const email = session.customer_details?.email;
  if (!email) throw new Error("Paid Checkout Session is missing customer email");
  const shipping = session.collected_information?.shipping_details;
  const selectedProductIds = parseSelectedProductIds(session.metadata?.["selected_product_ids"]);
  const lineItems = session.line_items?.data ?? [];
  const selectedTotal = lineItems.reduce((sum, item) => sum + (item.amount_total ?? 0), 0);
  const items = selectedProductIds.length
    ? summarizeSelectedProducts(selectedProductIds, selectedTotal)
    : lineItems.map((item) => ({
        name: item.description ?? "LockHabit item",
        quantity: item.quantity ?? 1,
        amountTotal: item.amount_total ?? 0,
      }));
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
    paidAt: paidAtUnixSeconds ? new Date(paidAtUnixSeconds * 1000).toISOString() : null,
    discountCode: appliedDiscountCode(session),
    discountAmount: session.total_details?.amount_discount ?? 0,
    orderKind: describeOrderKind(session, selectedProductIds),
  };
}

function paidMerchandiseCents(session: Stripe.Checkout.Session): number {
  return Math.max(
    0,
    (session.amount_total ?? 0) -
      (session.total_details?.amount_shipping ?? 0) -
      (session.total_details?.amount_tax ?? 0),
  );
}

export async function processCheckoutWebhook(
  event: Stripe.Event,
  dependencies: WebhookDependencies,
): Promise<WebhookResult> {
  if (refundEvents.has(event.type as RefundSupportedEvent)) {
    return (await dependencies.applyRefundAdjustment?.(event)) ?? "ignored";
  }

  if (!checkoutEvents.has(event.type as CheckoutSupportedEvent)) return "ignored";
  const eventSession = event.data.object as Stripe.Checkout.Session;
  const session = await dependencies.retrieveSession(eventSession.id);

  if (event.type === "checkout.session.expired") {
    await dependencies.releaseReservedReward?.(session.id);
    await dependencies.recordNonPaidEvent(event, session, "expired");
    return "expired";
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await dependencies.releaseReservedReward?.(session.id);
    await dependencies.recordNonPaidEvent(event, session, "payment_failed");
    return "payment_failed";
  }

  if (session.payment_status !== "paid") {
    await dependencies.recordNonPaidEvent(event, session, "payment_pending");
    return "payment_pending";
  }

  const order = checkoutOrder(session, typeof event.created === "number" ? event.created : null);
  const record = await dependencies.recordPaidOrder(event, session, order);
  try {
    await dependencies.finalizePaidGrowth?.(event, session, record);
  } catch (error) {
    console.error(
      `[Stripe webhook] growth finalize failed for ${event.id}:`,
      error instanceof Error ? error.message : "unknown error",
    );
  }
  try {
    await dependencies.sendConfirmationIfPending({ ...order, ...record });
  } catch {
    // Payment persistence is authoritative. Email delivery is tracked separately and
    // must never make Stripe retry an already-recorded paid event.
  }
  return "paid";
}

async function finalizePaidGrowth(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  record: PaidOrderRecord,
) {
  await supabaseAdmin.rpc("redeem_returning_customer_reward", {
    p_checkout_session_id: session.id,
  });

  const creatorId = session.metadata?.["creator_id"]?.trim();
  if (!creatorId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  const merchandise = paidMerchandiseCents(session);
  const bps = Number(session.metadata?.["commission_bps"] ?? "1000");
  const amount = commissionCents(merchandise, Number.isFinite(bps) ? bps : 1000);
  const paidAt = new Date((event.created || Math.floor(Date.now() / 1000)) * 1000);
  const availableAt = commissionAvailableAt(paidAt).toISOString();
  const attributionToken = session.metadata?.["attribution_token"]?.trim() || null;

  const { data: attribution, error: attributionError } = await supabaseAdmin
    .from("creator_attributions")
    .upsert(
      {
        creator_id: creatorId,
        attribution_token: attributionToken,
        checkout_session_id: session.id,
        payment_intent_id: paymentIntentId,
        order_number: record.order_number,
        paid_merchandise_cents: merchandise,
        currency: session.currency ?? "usd",
        paid_at: paidAt.toISOString(),
      },
      { onConflict: "checkout_session_id" },
    )
    .select("id")
    .maybeSingle();
  if (attributionError) throw attributionError;
  if (!attribution?.id || amount <= 0) return;

  const idempotencyKey = `commission:${paymentIntentId ?? session.id}`;
  const { error: ledgerError } = await supabaseAdmin.from("creator_commission_ledger").upsert(
    {
      creator_id: creatorId,
      attribution_id: attribution.id,
      entry_type: "commission",
      amount_cents: amount,
      currency: session.currency ?? "usd",
      status: "pending",
      available_at: availableAt,
      stripe_event_id: event.id,
      idempotency_key: idempotencyKey,
      note: "10% merchandise commission after discounts; shipping/tax excluded",
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );
  if (ledgerError) throw ledgerError;
}

async function applyRefundAdjustment(event: Stripe.Event): Promise<"ignored" | "refund_adjusted"> {
  const object = event.data.object as Stripe.Refund | Stripe.Charge;
  let paymentIntentId: string | null = null;
  let refundId: string | null = null;
  let refundedAmount = 0;
  let currency = "usd";

  if (event.type === "charge.refunded") {
    const charge = object as Stripe.Charge;
    paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);
    refundedAmount = charge.amount_refunded ?? 0;
    currency = charge.currency ?? "usd";
    refundId = `charge:${charge.id}:refunded:${refundedAmount}`;
  } else {
    const refund = object as Stripe.Refund;
    if (refund.status && refund.status !== "succeeded") return "ignored";
    paymentIntentId =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : (refund.payment_intent?.id ?? null);
    refundedAmount = refund.amount ?? 0;
    currency = refund.currency ?? "usd";
    refundId = refund.id;
  }

  if (!paymentIntentId || !refundId || refundedAmount <= 0) return "ignored";

  const { data: attribution, error } = await supabaseAdmin
    .from("creator_attributions")
    .select("id, creator_id, paid_merchandise_cents")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (error) throw error;
  if (!attribution) return "ignored";

  const { data: ledgerRows, error: ledgerReadError } = await supabaseAdmin
    .from("creator_commission_ledger")
    .select("amount_cents, entry_type, status")
    .eq("attribution_id", attribution.id);
  if (ledgerReadError) throw ledgerReadError;

  const netCommission = (ledgerRows ?? []).reduce((sum, row) => {
    if (row.entry_type === "commission") return sum + row.amount_cents;
    if (row.entry_type === "refund_adjustment") return sum + row.amount_cents;
    return sum;
  }, 0);
  if (netCommission <= 0) return "ignored";

  const merchandise = Math.max(1, attribution.paid_merchandise_cents);
  const originalCommission = (ledgerRows ?? [])
    .filter((row) => row.entry_type === "commission")
    .reduce((sum, row) => sum + row.amount_cents, 0);
  const proportional = Math.min(
    netCommission,
    Math.floor((refundedAmount / merchandise) * originalCommission),
  );
  const clawback = Math.max(0, Math.min(netCommission, proportional || netCommission));
  if (clawback <= 0) return "ignored";

  const idempotencyKey = `refund_adjustment:${refundId}`;
  const { error: insertError } = await supabaseAdmin.from("creator_commission_ledger").upsert(
    {
      creator_id: attribution.creator_id,
      attribution_id: attribution.id,
      entry_type: "refund_adjustment",
      amount_cents: -clawback,
      currency,
      status: clawback >= netCommission ? "reversed" : "available",
      available_at: null,
      stripe_event_id: event.id,
      idempotency_key: idempotencyKey,
      note: `Refund adjustment for ${refundId}`,
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );
  if (insertError) throw insertError;

  if (clawback >= netCommission) {
    await supabaseAdmin
      .from("creator_commission_ledger")
      .update({ status: "reversed" })
      .eq("attribution_id", attribution.id)
      .eq("entry_type", "commission")
      .in("status", ["pending", "available"]);
  }

  return "refund_adjusted";
}

export function createWebhookDependencies(
  stripe: Stripe,
  stripeLivemode: boolean,
): WebhookDependencies {
  return {
    retrieveSession: (id) =>
      stripe.checkout.sessions.retrieve(id, {
        expand: ["line_items.data.price.product", "payment_intent", "discounts.promotion_code"],
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
      const { error: modeError } = await supabaseAdmin
        .from("orders")
        .update({ stripe_livemode: stripeLivemode })
        .eq("id", row.order_id);
      if (modeError) throw modeError;
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
    releaseReservedReward: async (checkoutSessionId) => {
      await supabaseAdmin.rpc("release_returning_customer_reward", {
        p_checkout_session_id: checkoutSessionId,
      });
    },
    finalizePaidGrowth,
    applyRefundAdjustment,
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
