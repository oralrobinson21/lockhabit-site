import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

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
  createMagicLinkHash: async (email) => {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const hash = data?.properties?.hashed_token;
    if (error || !hash) throw new Error("Sign-in link could not be created.");
    return hash;
  },
  sendLoginEmail: async ({ to, link, idempotencyKey }) => {
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
        subject: "Your LOCKHABIT orders sign-in link",
        text: `This one-time sign-in link grants access to your LOCKHABIT order dashboard. If you did not request it, ignore this email.\n\n${link}`,
        html: `<p>Sign in to your LOCKHABIT owner orders dashboard:</p><p><a href="${link}">Open my orders</a></p><p>This is a one-time sign-in link. Ignore this message if you did not request it.</p>`,
      }),
    });
    if (!response.ok) throw new Error("Sign-in email could not be delivered.");
  },
  listOrders: async () => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,order_number,created_at,customer_name,customer_email,amount_total,currency,payment_status,fulfillment_status,items,shipping_details,payment_intent_id,stripe_livemode,tracking_carrier,tracking_number,tracking_url,estimated_delivery_date,shipped_at,tracking_notified_at",
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
        "id,order_number,customer_email,payment_status,tracking_carrier,tracking_number,estimated_delivery_date,tracking_notified_at",
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
      estimatedDeliveryDate: data.estimated_delivery_date,
      trackingNotifiedAt: data.tracking_notified_at,
    };
  },
  persistTracking: async ({
    orderId,
    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDeliveryDate,
    shippedAt,
  }) => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        fulfillment_status: "shipped",
        tracking_carrier: carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        estimated_delivery_date: estimatedDeliveryDate,
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
    estimatedDeliveryDate,
    idempotencyKey,
  }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    if (!apiKey || !from) return false;
    const formatted = `LH-${String(orderNumber).padStart(6, "0")}`;
    const deliveryLabel = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${estimatedDeliveryDate}T12:00:00.000Z`));
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
        text: `Good news: your LOCKHABIT order ${formatted} has shipped.\nCarrier: ${carrier}\nTracking number: ${trackingNumber}\nEstimated delivery: ${deliveryLabel}\nTrack your package: ${trackingUrl}\n\nThe delivery date is an estimate and may change based on carrier updates. Questions? Reply to this email.`,
        html: `<p>Good news: your LOCKHABIT order <strong>${formatted}</strong> has shipped.</p><p>Carrier: ${carrier}<br>Tracking number: ${trackingNumber}<br>Estimated delivery: <strong>${deliveryLabel}</strong></p><p><a href="${trackingUrl}">Track your package</a></p><p>The delivery date is an estimate and may change based on carrier updates. Questions? Reply to this email.</p>`,
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


function configuredOwnerEmail(): string {
  const email = process.env["LOCKHABIT_ADMIN_EMAIL"]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Order management is not configured.");
  }
  return email;
}

function adminAuthSecret(): string {
  const secret = process.env["LOCKHABIT_ADMIN_AUTH_SECRET"];
  if (!secret || secret.length < 32) throw new Error("Owner password setup is not configured.");
  return secret;
}

function passwordCodeDigest(email: string, code: string): string {
  return createHmac("sha256", adminAuthSecret()).update(`${email}:${code}`).digest("hex");
}

function sameDigest(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

async function sendPasswordCodeEmail(to: string, code: string, idempotencyKey: string) {
  const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
  const apiKey = process.env["RESEND_API_KEY"];
  if (!from || !apiKey) throw new Error("Owner password email is not configured.");

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
      subject: "Your LOCKHABIT owner password code",
      text: `Your LOCKHABIT owner verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,
      html: `<p>Your LOCKHABIT owner verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not request this, ignore this email.</p>`,
    }),
  });

  if (!response.ok) throw new Error("Owner password email could not be delivered.");
}

export async function emailOrderAdminPasswordCode(email: string): Promise<void> {
  const ownerEmail = configuredOwnerEmail();
  if (email.trim().toLowerCase() !== ownerEmail) return;

  const { data: claimed, error: claimError } = await supabaseAdmin.rpc(
    "claim_lockhabit_admin_login",
    { p_email: ownerEmail },
  );
  if (claimError) throw new Error("Password setup is unavailable. Try again later.");
  if (!claimed) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60_000).toISOString();
  const digest = passwordCodeDigest(ownerEmail, code);

  const { error: challengeError } = await supabaseAdmin
    .from("order_admin_password_challenges")
    .upsert(
      {
        email: ownerEmail,
        code_digest: digest,
        expires_at: expiresAt,
        attempts: 0,
        created_at: now.toISOString(),
      },
      { onConflict: "email" },
    );
  if (challengeError) throw new Error("Password setup is unavailable. Try again later.");

  try {
    await sendPasswordCodeEmail(
      ownerEmail,
      code,
      `lockhabit-admin-password-${Math.floor(now.getTime() / 90_000) * 90_000}`,
    );
  } catch (error) {
    await supabaseAdmin.from("order_admin_password_challenges").delete().eq("email", ownerEmail);
    throw error;
  }
}

export async function setOrderAdminPassword(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  const ownerEmail = configuredOwnerEmail();
  if (email.trim().toLowerCase() !== ownerEmail) {
    throw new Error("The verification code is invalid or expired.");
  }
  if (!/^\d{6}$/.test(code)) throw new Error("The verification code is invalid or expired.");
  if (password.length < 12 || password.length > 128) {
    throw new Error("Use a password between 12 and 128 characters.");
  }

  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from("order_admin_password_challenges")
    .select("email,code_digest,expires_at,attempts")
    .eq("email", ownerEmail)
    .maybeSingle();
  if (challengeError || !challenge) throw new Error("The verification code is invalid or expired.");

  const expired = new Date(challenge.expires_at).getTime() <= Date.now();
  const locked = challenge.attempts >= 5;
  const matches = sameDigest(challenge.code_digest, passwordCodeDigest(ownerEmail, code));
  if (expired || locked || !matches) {
    if (!expired && !locked) {
      await supabaseAdmin
        .from("order_admin_password_challenges")
        .update({ attempts: Math.min(10, challenge.attempts + 1) })
        .eq("email", ownerEmail);
    }
    throw new Error("The verification code is invalid or expired.");
  }

  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error("Owner password could not be updated.");

  const existing = users.users.find((user) => user.email?.trim().toLowerCase() === ownerEmail);
  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error("Owner password could not be updated.");
  } else {
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
    });
    if (error) throw new Error("Owner password could not be created.");
  }

  await supabaseAdmin.from("order_admin_password_challenges").delete().eq("email", ownerEmail);
}

export const {
  requireOrderAdmin,
  emailOrderAdminLink,
  readAdminOrders,
  saveAdminTracking,
  readAdminRefunds,
} = orderAdminService;
