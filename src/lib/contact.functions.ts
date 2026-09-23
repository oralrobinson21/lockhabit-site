import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  orderNumber: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional().default(""),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof contactInput>) => contactInput.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };

    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    const support = process.env["LOCKHABIT_SUPPORT_EMAIL"];
    if (!apiKey || !from || !support) {
      return { ok: false as const, error: "The front desk email is temporarily unavailable." };
    }

    const safeName = data.name.replace(/[<>]/g, "");
    const safeOrder = data.orderNumber.replace(/[<>]/g, "");
    const safeMessage = data.message.replace(/[<>]/g, "");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [support],
        reply_to: data.email,
        subject: safeOrder
          ? `LOCKHABIT support · ${safeOrder} · ${safeName}`
          : `LOCKHABIT support · ${safeName}`,
        text: [
          `Name: ${safeName}`,
          `Email: ${data.email}`,
          safeOrder ? `Order: ${safeOrder}` : null,
          "",
          safeMessage,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      console.error("Contact email failed", response.status, payload.message ?? "");
      return { ok: false as const, error: "We couldn't send that note. Please try again." };
    }

    return { ok: true as const };
  });
