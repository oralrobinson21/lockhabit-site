import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createStripeClient, getStripeEnvironment } from "@/lib/stripe.server";
import { trackingLink, type Carrier } from "@/lib/shipping-tracking";

function adminEmail(): string {
  const address = process.env["LOCKHABIT_ADMIN_EMAIL"]?.trim().toLowerCase();
  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new Error("Order management is not configured.");
  }
  return address;
}

export async function requireOrderAdmin(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user || data.user.email?.toLowerCase() !== adminEmail() ||
      !data.user.email_confirmed_at) {
    throw new Error("Owner sign-in is required.");
  }
  return data.user;
}

export async function emailOrderAdminLink(email: string) {
  if (email.trim().toLowerCase() !== adminEmail()) return;
  const { data: claimed, error: claimError } = await supabaseAdmin.rpc(
    "claim_lockhabit_admin_login", { p_email: adminEmail() },
  );
  if (claimError) throw new Error("Sign-in is unavailable. Try again later.");
  if (!claimed) return;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail(),
  });
  const hash = data?.properties?.hashed_token;
  if (error || !hash) throw new Error("Sign-in link could not be created.");
  const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
  const apiKey = process.env["RESEND_API_KEY"];
  if (!from || !apiKey) throw new Error("Sign-in email is not configured.");
  // Use the URL fragment so the one-time token is not sent in HTTP requests or Referer headers.
  const link = `https://lockhabit.com/admin/orders#token_hash=${encodeURIComponent(hash)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lockhabit-admin-login-${Date.now() - (Date.now() % 90000)}`,
    },
    body: JSON.stringify({
      from,
      to: [adminEmail()],
      subject: "Your LOCKHABIT orders sign-in link",
      text: `This one-time sign-in link grants access to your LOCKHABIT order dashboard. If you did not request it, ignore this email.\n\n${link}`,
      html: `<p>Sign in to your LOCKHABIT owner orders dashboard:</p><p><a href="${link}">Open my orders</a></p><p>This is a one-time sign-in link. Ignore this message if you did not request it.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Sign-in email could not be delivered.");
}

export async function readAdminOrders(accessToken: string) {
  await requireOrderAdmin(accessToken);
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id,order_number,created_at,customer_name,customer_email,amount_total,currency,payment_status,fulfillment_status,items,shipping_details,payment_intent_id,tracking_carrier,tracking_number,tracking_url,shipped_at,tracking_notified_at",
    )
    .order("created_at", { ascending: false })
    .limit(75);
  if (error) throw new Error("Orders could not be loaded.");
  return data ?? [];
}

export async function saveAdminTracking(
  accessToken: string,
  orderId: string,
  carrier: Carrier,
  trackingNumber: string,
) {
  await requireOrderAdmin(accessToken);
  const number = trackingNumber.trim().replace(/\s+/g, "");
  const url = trackingLink(carrier, number);
  const { data: oldOrder, error: readError } = await supabaseAdmin
    .from("orders")
    .select("id,order_number,customer_email,payment_status,tracking_carrier,tracking_number,tracking_notified_at")
    .eq("id", orderId)
    .maybeSingle();
  if (readError || !oldOrder || oldOrder.payment_status !== "paid") {
    throw new Error("A paid order was not found.");
  }
  const sameNumber = oldOrder.tracking_carrier === carrier && oldOrder.tracking_number === number;
  if (sameNumber && oldOrder.tracking_notified_at) {
    return { saved: true as const, notified: true as const, trackingUrl: url };
  }
  const { error: writeError } = await supabaseAdmin
    .from("orders")
    .update({
      fulfillment_status: "shipped",
      tracking_carrier: carrier,
      tracking_number: number,
      tracking_url: url,
      shipped_at: new Date().toISOString(),
      tracking_notified_at: null,
    })
    .eq("id", orderId);
  if (writeError) throw new Error("Tracking could not be saved.");

  const email = oldOrder.customer_email;
  if (!email || !process.env["RESEND_API_KEY"] || !process.env["LOCKHABIT_ORDER_FROM_EMAIL"]) {
    return { saved: true as const, notified: false as const, trackingUrl: url };
  }
  const formatted = `LH-${String(oldOrder.order_number).padStart(6, "0")}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["RESEND_API_KEY"]}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lockhabit-shipping-${orderId}-${carrier}-${number}`,
    },
    body: JSON.stringify({
      from: process.env["LOCKHABIT_ORDER_FROM_EMAIL"],
      to: [email],
      reply_to: process.env["LOCKHABIT_SUPPORT_EMAIL"],
      subject: `Your LOCKHABIT order ${formatted} has shipped`,
      text: `Good news: your LOCKHABIT order ${formatted} has shipped.\nCarrier: ${carrier}\nTracking number: ${number}\nTrack your package: ${url}\n\nTracking updates are provided by the carrier and may take time to appear. Questions? Reply to this email.`,
      html: `<p>Good news: your LOCKHABIT order <strong>${formatted}</strong> has shipped.</p><p>Carrier: ${carrier}<br>Tracking number: ${number}</p><p><a href="${url}">Track your package</a></p><p>Carrier updates may take time to appear. Questions? Reply to this email.</p>`,
    }),
  });
  if (!response.ok) return { saved: true as const, notified: false as const, trackingUrl: url };
  await supabaseAdmin.from("orders").update({ tracking_notified_at: new Date().toISOString() }).eq("id", orderId);
  return { saved: true as const, notified: true as const, trackingUrl: url };
}

export async function readAdminRefunds(accessToken: string, orderId: string) {
  await requireOrderAdmin(accessToken);
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id,payment_intent_id")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order?.payment_intent_id) throw new Error("No payment reference is available.");
  const mode = getStripeEnvironment();
  const stripe = createStripeClient(mode);
  const refunds = await stripe.refunds.list({ payment_intent: order.payment_intent_id, limit: 20 });
  return {
    stripeUrl: `https://dashboard.stripe.com/${mode === "sandbox" ? "test/" : ""}payments/${encodeURIComponent(order.payment_intent_id)}`,
    refunds: refunds.data.map((refund) => ({
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason ?? null,
      created: refund.created,
    })),
  };
}
