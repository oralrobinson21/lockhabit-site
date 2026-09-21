import { createFileRoute } from "@tanstack/react-router";

import { sendOrderConfirmation } from "@/lib/order-confirmation-email.server";

export const Route = createFileRoute("/api/email-test")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("token") !== "retro-test-9f4c2d7a") {
          return new Response("Not found", { status: 404 });
        }

        const result = await sendOrderConfirmation({
          checkoutSessionId: "email-template-test-2026-09-21-2",
          orderNumber: 999999,
          customerEmail: "oralrobinson21@outlook.com",
          customerName: "Oral",
          currency: "usd",
          subtotal: 8900,
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
          items: [{ name: "Coconut Beach Soap", quantity: 3, amountTotal: 100 }],
        });

        return Response.json({ sent: true, id: result.id ?? null });
      },
    },
  },
});
