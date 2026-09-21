export type ConfirmationItem = {
  name: string;
  quantity: number;
  amountTotal: number;
};

export type OrderConfirmation = {
  checkoutSessionId: string;
  orderNumber: number;
  customerEmail: string;
  customerName: string | null;
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Record<string, string | null> | null;
  items: ConfirmationItem[];
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

const firstName = (name: string | null) => name?.trim().split(/\s+/)[0] || "there";

const addressLines = (address: OrderConfirmation["shippingAddress"]) => {
  if (!address) return ["Shipping address provided at checkout"];
  return [
    address["line1"],
    address["line2"],
    [address["city"], address["state"], address["postal_code"]].filter(Boolean).join(", "),
    address["country"],
  ].filter((line): line is string => Boolean(line));
};

export function renderOrderConfirmation(order: OrderConfirmation) {
  const supportEmail = process.env["LOCKHABIT_SUPPORT_EMAIL"] ?? "support@lockhabit.com";
  const orderLabel = `LH-${String(order.orderNumber).padStart(6, "0")}`;
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #dfd5c6;color:#19382f">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #dfd5c6;text-align:right;color:#19382f">${money(item.amountTotal, order.currency)}</td>
        </tr>`,
    )
    .join("");
  const address = addressLines(order.shippingAddress).map(escapeHtml).join("<br>");
  const textItems = order.items
    .map((item) => `${item.name} × ${item.quantity} — ${money(item.amountTotal, order.currency)}`)
    .join("\n");

  return {
    subject: "Your LockHabit order is confirmed 🌿",
    html: `<!doctype html>
<html><body style="margin:0;background:#f8f1e5;font-family:Arial,sans-serif;color:#19382f">
  <div style="max-width:640px;margin:0 auto;padding:32px 18px">
    <div style="background:#f4c95d;border:2px solid #19382f;padding:28px;text-align:center">
      <div style="font-size:13px;font-weight:800;letter-spacing:2px">LOCKHABIT SOAP &amp; BODY CARE</div>
      <h1 style="margin:14px 0 6px;font-family:Georgia,serif;font-size:34px">Order confirmed.</h1>
      <p style="margin:0">Hi ${escapeHtml(firstName(order.customerName))}, your sunny essentials are officially checked in.</p>
    </div>
    <div style="background:#fffaf0;border:2px solid #19382f;border-top:0;padding:28px">
      <p style="margin-top:0"><strong>Order ${orderLabel}</strong><br>Payment confirmed by Stripe.</p>
      <table style="width:100%;border-collapse:collapse">${itemRows}</table>
      <table style="width:100%;margin-top:18px;border-collapse:collapse">
        <tr><td style="padding:4px 0">Subtotal</td><td style="text-align:right">${money(order.subtotal, order.currency)}</td></tr>
        <tr><td style="padding:4px 0">Shipping</td><td style="text-align:right">${money(order.shipping, order.currency)}</td></tr>
        <tr><td style="padding:4px 0">Tax</td><td style="text-align:right">${money(order.tax, order.currency)}</td></tr>
        <tr><td style="padding:12px 0 4px;font-size:18px"><strong>Total paid</strong></td><td style="padding:12px 0 4px;text-align:right;font-size:18px"><strong>${money(order.total, order.currency)}</strong></td></tr>
      </table>
      <div style="margin-top:24px;padding:18px;background:#d8eee5;border:1px solid #19382f">
        <strong>Shipping to</strong><br>${order.customerName ? `${escapeHtml(order.customerName)}<br>` : ""}${address}
      </div>
      <p style="margin:24px 0 0">Questions? Reply to this email or contact <a style="color:#b84933" href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    </div>
  </div>
</body></html>`,
    text: `Hi ${firstName(order.customerName)},

Your LockHabit order ${orderLabel} is confirmed. Payment was confirmed by Stripe.

${textItems}

Subtotal: ${money(order.subtotal, order.currency)}
Shipping: ${money(order.shipping, order.currency)}
Tax: ${money(order.tax, order.currency)}
Total paid: ${money(order.total, order.currency)}

Shipping to:
${order.customerName ? `${order.customerName}\n` : ""}${addressLines(order.shippingAddress).join("\n")}

Questions? Contact ${supportEmail}.`,
  };
}

export async function sendOrderConfirmation(order: OrderConfirmation): Promise<string> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
  if (!apiKey || !from) throw new Error("Order confirmation email is not configured");

  const message = renderOrderConfirmation(order);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lockhabit-order-${order.checkoutSessionId}`,
    },
    body: JSON.stringify({
      from,
      to: [order.customerEmail],
      reply_to: process.env["LOCKHABIT_SUPPORT_EMAIL"],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok || !payload.id) {
    throw new Error(`Confirmation provider rejected the request (${response.status})`);
  }
  return payload.id;
}
