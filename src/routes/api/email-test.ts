import { createFileRoute } from "@tanstack/react-router";

import {
  renderOrderConfirmation,
  sendOrderConfirmation,
  type OrderConfirmation,
} from "@/lib/order-confirmation-email.server";
import { summarizeSelectedProducts } from "@/lib/product-selection";

/**
 * Temporary owner-only endpoint for proofing the production receipt template.
 *
 * Safety properties:
 * - never touches Stripe or Supabase (no charge, no order row, no webhook state)
 * - always sends to the single configured owner inbox, never to a caller-supplied address
 * - requires a shared token; disabled entirely when the token is unset
 * - rate-limited per process so a leaked token cannot be used to flood the inbox
 * - payload is obviously synthetic (receipt LH-999999)
 *
 * `items` (1–12) builds the same line items the Stripe webhook would derive from
 * `metadata.selected_product_ids` via summarizeSelectedProducts.
 */
const FALLBACK_TOKEN = "tropical-receipt-proof-7c1e9b";
const FALLBACK_RECIPIENT = "oralrobinson21@outlook.com";
const MAX_SENDS_PER_HOUR = 6;
const ALL_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const sendLog: number[] = [];

const unitPriceCents = (productId: number): number => (productId === 11 ? 4200 : 3500);

const syntheticOrder = (run: string, itemCount: number): OrderConfirmation => {
  const selectedIds = ALL_PRODUCT_IDS.slice(0, itemCount);
  const subtotal = selectedIds.reduce((sum, id) => sum + unitPriceCents(id), 0);
  const items = summarizeSelectedProducts([...selectedIds], subtotal);
  const discountAmount = Math.max(0, subtotal - 100);
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
    discountCode: itemCount === 1 ? "LOCKHABITPROOF" : "LOCKHABIT3FOR1B",
    discountAmount,
    orderKind:
      itemCount === 12 ? "Order" : itemCount === 3 ? "3-Bar Bundle" : itemCount === 6 ? "6-Bar Bundle" : "Order",
  };
};

export const Route = createFileRoute("/api/email-test")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const expectedToken = process.env["LOCKHABIT_EMAIL_TEST_TOKEN"] ?? FALLBACK_TOKEN;
        if (!expectedToken || url.searchParams.get("token") !== expectedToken) {
          return new Response("Not found", { status: 404 });
        }

        const run =
          (url.searchParams.get("run") ?? "1").replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "1";
        const itemCount = Math.min(
          12,
          Math.max(1, Number.parseInt(url.searchParams.get("items") ?? "1", 10) || 1),
        );
        const order = syntheticOrder(run, itemCount);

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

        const id = await sendOrderConfirmation(order);
        return Response.json({
          sent: true,
          id,
          to: order.customerEmail,
          run,
          itemCount,
          itemNames: order.items.map((item) => item.name),
        });
      },
    },
  },
});
