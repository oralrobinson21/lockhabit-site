import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

import {
  renderOrderConfirmation,
  sendOrderConfirmation,
  type OrderConfirmation,
} from "@/lib/order-confirmation-email.server";

/**
 * Temporary owner-only endpoint for proofing the production receipt template.
 *
 * Safety properties:
 * - never touches Stripe or Supabase (no charge, no order row, no webhook state)
 * - always sends to the single configured owner inbox, never to a caller-supplied address
 * - requires a shared token; disabled entirely when the token is unset
 * - rate-limited per process so a leaked token cannot be used to flood the inbox
 * - payload is obviously synthetic (receipt LH-999999)
 */
const FALLBACK_RECIPIENT = "oralrobinson21@outlook.com";
const MAX_SENDS_PER_HOUR = 6;

const sendLog: number[] = [];

const singleItem = [{ name: "Build Your Own 3-Bar Bundle", quantity: 1, amountTotal: 8900 }];
const multiItems = [
  { name: "Coconut Beach Soap", quantity: 1, amountTotal: 2967 },
  { name: "Oat Milk Honey Soap", quantity: 1, amountTotal: 2967 },
  { name: "Calming Lavender Soap", quantity: 1, amountTotal: 2966 },
];

const syntheticOrder = (run: string, itemCount: number): OrderConfirmation => {
  const items = itemCount >= 3 ? multiItems : singleItem;
  const subtotal = items.reduce((sum, item) => sum + item.amountTotal, 0);
  return {
    checkoutSessionId: `email-template-proof-${run}`,
    orderNumber: 999999,
    customerEmail: process.env["LOCKHABIT_EMAIL_TEST_RECIPIENT"] ?? FALLBACK_RECIPIENT,
    customerName: "Oral Robinson",
    currency: "usd",
    subtotal,
    shipping: 0,
    tax: 0,
    total: 100,
    shippingAddress: {
      line1: "40 W Mosholu Pkwy S",
      line2: null,
      city: "Bronx",
      state: "NY",
      postal_code: "10468",
      country: "US",
    },
    items,
    paidAt: new Date().toISOString(),
    discountCode: "LOCKHABIT3FOR1B",
    discountAmount: 8800,
    orderKind: itemCount >= 3 ? "3-Bar Mix" : "3-Bar Bundle",
  };
};


async function storedPaidOrder(orderNumber: number): Promise<OrderConfirmation | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "checkout_session_id,order_number,customer_email,customer_name,currency,amount_subtotal,amount_shipping,amount_tax,amount_total,shipping_details,items,payment_status,created_at",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.payment_status !== "paid" || !data.customer_email) return null;

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const name = typeof item["name"] === "string" ? item["name"] : null;
    const quantity = typeof item["quantity"] === "number" ? item["quantity"] : null;
    const amountTotal = typeof item["amountTotal"] === "number" ? item["amountTotal"] : null;
    return name && quantity && amountTotal !== null ? [{ name, quantity, amountTotal }] : [];
  });
  if (!items.length) throw new Error("Stored order has no receipt line items");

  const subtotal = data.amount_subtotal ?? 0;
  const total = data.amount_total ?? 0;
  const discountAmount = Math.max(
    0,
    subtotal + (data.amount_shipping ?? 0) + (data.amount_tax ?? 0) - total,
  );
  const soapQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    checkoutSessionId: data.checkout_session_id,
    orderNumber: data.order_number,
    customerEmail: data.customer_email,
    customerName: data.customer_name,
    currency: data.currency ?? "usd",
    subtotal,
    shipping: data.amount_shipping ?? 0,
    tax: data.amount_tax ?? 0,
    total,
    shippingAddress:
      data.shipping_details && typeof data.shipping_details === "object"
        ? (data.shipping_details as Record<string, string | null>)
        : null,
    items,
    paidAt: data.created_at ?? null,
    discountCode: null,
    discountAmount,
    orderKind: soapQuantity === 3 ? "3-Bar Bundle" : soapQuantity === 6 ? "6-Bar Bundle" : "Order",
  };
}

export const Route = createFileRoute("/api/email-test")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const expectedToken = process.env["LOCKHABIT_EMAIL_TEST_TOKEN"];
        if (!expectedToken || url.searchParams.get("token") !== expectedToken) {
          return new Response("Not found", { status: 404 });
        }

        const run =
          (url.searchParams.get("run") ?? "1").replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "1";
        const itemCount = Math.min(
          12,
          Math.max(1, Number.parseInt(url.searchParams.get("items") ?? "1", 10) || 1),
        );
        const requestedOrder = Number.parseInt(url.searchParams.get("order") ?? "", 10);
        const storedOrder =
          Number.isFinite(requestedOrder) && requestedOrder > 0
            ? await storedPaidOrder(requestedOrder)
            : null;
        if (requestedOrder > 0 && !storedOrder) {
          return Response.json({ sent: false, error: "paid_order_not_found" }, { status: 404 });
        }
        const order = storedOrder ?? syntheticOrder(run, itemCount);

        if (url.searchParams.get("preview") === "1") {
          // Browser preview has no MIME context for cid:; use data: URLs so
          // dynamic ink is readable without hitting /api/email-ink.
          const { html } = await renderOrderConfirmation(order, { dynamicInk: "data" });
          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
          });
        }

        const now = Date.now();
        while (sendLog.length && now - sendLog[0]! > 60 * 60 * 1000) sendLog.shift();
        if (sendLog.length >= MAX_SENDS_PER_HOUR) {
          return Response.json({ sent: false, error: "rate_limited" }, { status: 429 });
        }
        sendLog.push(now);

        const id = await sendOrderConfirmation(order, {
          idempotencyKey: storedOrder
            ? `lockhabit-order-${order.checkoutSessionId}-manual-${run}`
            : undefined,
        });
        return Response.json({
          sent: true,
          id,
          to: order.customerEmail,
          run,
          orderNumber: order.orderNumber,
          source: storedOrder ? "stored_paid_order" : "synthetic",
        });
      },
    },
  },
});
