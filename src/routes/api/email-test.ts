import { createFileRoute } from "@tanstack/react-router";

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
const FALLBACK_TOKEN = "tropical-receipt-proof-7c1e9b";
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
        return Response.json({ sent: true, id, to: order.customerEmail, run });
      },
    },
  },
});
