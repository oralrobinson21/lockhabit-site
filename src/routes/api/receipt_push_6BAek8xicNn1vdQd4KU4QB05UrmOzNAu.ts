import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendOrderConfirmation, type OrderConfirmation } from "@/lib/order-confirmation-email.server";

const ORDER_NUMBER = 16;

async function loadOrder(): Promise<OrderConfirmation> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("checkout_session_id,order_number,customer_email,customer_name,currency,amount_subtotal,amount_shipping,amount_tax,amount_total,shipping_details,items,payment_status,created_at")
    .eq("order_number", ORDER_NUMBER)
    .single();

  if (error) throw error;
  if (data.payment_status !== "paid" || !data.customer_email) throw new Error("Paid order not found");

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const name = typeof item["name"] === "string" ? item["name"] : null;
    const quantity = typeof item["quantity"] === "number" ? item["quantity"] : null;
    const amountTotal = typeof item["amountTotal"] === "number" ? item["amountTotal"] : null;
    return name && quantity && amountTotal !== null ? [{ name, quantity, amountTotal }] : [];
  });
  if (!items.length) throw new Error("No receipt items");

  const subtotal = data.amount_subtotal ?? 0;
  const shipping = data.amount_shipping ?? 0;
  const tax = data.amount_tax ?? 0;
  const total = data.amount_total ?? 0;
  const discountAmount = Math.max(0, subtotal + shipping + tax - total);
  const qty = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    checkoutSessionId: data.checkout_session_id,
    orderNumber: data.order_number,
    customerEmail: data.customer_email,
    customerName: data.customer_name,
    currency: data.currency ?? "usd",
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress: data.shipping_details && typeof data.shipping_details === "object"
      ? (data.shipping_details as Record<string, string | null>)
      : null,
    items,
    paidAt: data.created_at ?? null,
    discountCode: null,
    discountAmount,
    orderKind: qty === 3 ? "3-Bar Bundle" : qty === 6 ? "6-Bar Bundle" : "Order",
  };
}

export const Route = createFileRoute("/api/receipt_push_6BAek8xicNn1vdQd4KU4QB05UrmOzNAu")({
  server: {
    handlers: {
      GET: async () => {
        const order = await loadOrder();
        const id = await sendOrderConfirmation(order, {
          idempotencyKey: "lockhabit-order-16-owner-resend-20260923-001",
        });
        return Response.json({ ok: true, orderNumber: ORDER_NUMBER, providerMessageId: id });
      },
    },
  },
});
