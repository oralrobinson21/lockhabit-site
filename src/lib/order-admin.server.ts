import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createOrderAdminService, type RefundRecord } from "@/lib/order-admin-core";
import { createStripeClient, getStripeEnvironment } from "@/lib/stripe.server";

const orderAdminService = createOrderAdminService({
  adminEmail: () => process.env["LOCKHABIT_ADMIN_EMAIL"],
  now: () => new Date(),
  getUser: async (accessToken) => {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user) return null;
    return {
      email: data.user.email ?? null,
      emailConfirmedAt: data.user.email_confirmed_at ?? null,
    };
  },
  claimLogin: async (email) => {
    const { data, error } = await supabaseAdmin.rpc("claim_lockhabit_admin_login", {
      p_email: email,
    });
    if (error) throw new Error("Sign-in is unavailable. Try again later.");
    return Boolean(data);
  },
  createEmailOtp: async (email) => {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const code = data?.properties?.email_otp;
    if (error || !code) throw new Error("Sign-in code could not be created.");
    return code;
  },
  sendLoginEmail: async ({ to, code, idempotencyKey }) => {
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    const apiKey = process.env["RESEND_API_KEY"];
    if (!from || !apiKey) throw new Error("Sign-in email is not configured.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Your LOCKHABIT owner sign-in code",
        text: `Your one-time LOCKHABIT owner sign-in code is: ${code}\n\nEnter this six-digit code on the Orders & Shipping page. If you did not request it, ignore this email.`,
        html: `<p>Your one-time LOCKHABIT owner sign-in code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>Enter this six-digit code on the Orders &amp; Shipping page. If you did not request it, ignore this email.</p>`,
      }),
    });
    if (!response.ok) throw new Error("Sign-in email could not be delivered.");
  },
  listOrders: async () => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,order_number,created_at,customer_name,customer_email,amount_total,currency,payment_status,fulfillment_status,items,shipping_details,payment_intent_id,stripe_livemode,tracking_carrier,tracking_number,tracking_url,shipped_at,tracking_notified_at",
      )
      .order("created_at", { ascending: false })
      .limit(75);
    if (error) throw new Error("Orders could not be loaded.");
    return data ?? [];
  },
  findTrackingOrder: async (orderId) => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,order_number,customer_email,payment_status,tracking_carrier,tracking_number,tracking_notified_at",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw new Error("Order could not be loaded.");
    if (!data) return null;
    return {
      id: data.id,
      orderNumber: data.order_number,
      customerEmail: data.customer_email,
      paymentStatus: data.payment_status,
      trackingCarrier: data.tracking_carrier,
      trackingNumber: data.tracking_number,
      trackingNotifiedAt: data.tracking_notified_at,
    };
  },
  persistTracking: async ({ orderId, carrier, trackingNumber, trackingUrl, shippedAt }) => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        fulfillment_status: "shipped",
        tracking_carrier: carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipped_at: shippedAt,
        tracking_notified_at: null,
      })
      .eq("id", orderId)
      .eq("payment_status", "paid")
      .select("id")
      .maybeSingle();
    if (error || !data) throw new Error("Tracking could not be saved.");
  },
  sendTrackingEmail: async ({
    to,
    orderNumber,
    carrier,
    trackingNumber,
    trackingUrl,
    idempotencyKey,
  }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    if (!apiKey || !from) return false;
    const formatted = `LH-${String(orderNumber).padStart(6, "0")}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: process.env["LOCKHABIT_SUPPORT_EMAIL"],
        subject: `Your LOCKHABIT order ${formatted} has shipped`,
        text: `Good news: your LOCKHABIT order ${formatted} has shipped.\nCarrier: ${carrier}\nTracking number: ${trackingNumber}\nTrack your package: ${trackingUrl}\n\nTracking updates are provided by the carrier and may take time to appear. Questions? Reply to this email.`,
        html: `<p>Good news: your LOCKHABIT order <strong>${formatted}</strong> has shipped.</p><p>Carrier: ${carrier}<br>Tracking number: ${trackingNumber}</p><p><a href="${trackingUrl}">Track your package</a></p><p>Carrier updates may take time to appear. Questions? Reply to this email.</p>`,
      }),
    });
    return response.ok;
  },
  markTrackingNotified: async ({ orderId, carrier, trackingNumber, notifiedAt }) => {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ tracking_notified_at: notifiedAt })
      .eq("id", orderId)
      .eq("tracking_carrier", carrier)
      .eq("tracking_number", trackingNumber);
    if (error) throw new Error("Tracking notification status could not be saved.");
  },
  findPaymentReference: async (orderId) => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("payment_intent_id,stripe_livemode")
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw new Error("Payment reference could not be loaded.");
    if (!data?.payment_intent_id) return null;
    return {
      paymentIntentId: data.payment_intent_id,
      stripeLivemode: data.stripe_livemode,
    };
  },
  listRefunds: async (paymentIntentId, mode): Promise<RefundRecord[]> => {
    const stripe = createStripeClient(mode);
    const refunds = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 20 });
    return refunds.data.map((refund) => ({
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason ?? null,
      created: refund.created,
    }));
  },
  defaultStripeMode: getStripeEnvironment,
  onNonFatalError: (context, error) => {
    console.error(
      `[Order admin] ${context} failed:`,
      error instanceof Error ? error.message : "unknown error",
    );
  },
});

export const {
  requireOrderAdmin,
  emailOrderAdminCode,
  readAdminOrders,
  saveAdminTracking,
  readAdminRefunds,
} = orderAdminService;
