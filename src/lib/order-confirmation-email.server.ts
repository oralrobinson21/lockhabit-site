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
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #d7c7a9;font:700 15px Arial;color:#45200a;">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:14px 0;border-bottom:1px solid #d7c7a9;text-align:right;font:700 15px Arial;color:#45200a;">${money(item.amountTotal, order.currency)}</td>
    </tr>`).join("");
  const address = addressLines(order.shippingAddress).map(escapeHtml).join("<br>");
  const textItems = order.items.map((item) => `${item.name} × ${item.quantity} — ${money(item.amountTotal, order.currency)}`).join("\n");

  return {
    subject: `Your LockHabit receipt • ${orderLabel}`,
    html: `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<style>
@media(max-width:640px){.shell{width:100%!important}.pad{padding-left:18px!important;padding-right:18px!important}.big{font-size:34px!important;line-height:36px!important}.stats td{display:block!important;width:100%!important;border-right:0!important;border-bottom:1px solid #d7c7a9!important;padding:12px 0!important}.cta{display:block!important;text-align:center!important}}
</style>
</head>
<body style="margin:0;background:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111;">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" class="shell" style="width:640px;max-width:640px;background:#f8edcf;border:2px solid #45200a;">
<tr><td style="background:#20a9b5;border-bottom:4px solid #45200a;padding:18px 26px;text-align:center;">
  <div style="font:900 12px Arial;letter-spacing:5px;color:#fff7df;">PERMANENT VACATION • GOOD HABITS</div>
</td></tr>
<tr><td class="pad" style="padding:28px 34px 18px;text-align:center;background:#f8edcf;">
  <div style="font:700 44px Georgia;color:#184d34;letter-spacing:2px;">LOCKHABIT</div>
  <div style="font:700 12px Arial;letter-spacing:4px;color:#184d34;margin-top:4px;">SOAP &amp; BODY CARE</div>
  <div style="font:800 10px Arial;letter-spacing:3px;color:#7c5a36;margin-top:9px;">SMALL RITUALS. BRIGHTER DAYS.</div>
</td></tr>
<tr><td class="pad" style="padding:8px 34px 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e5;border:3px solid #45200a;border-radius:22px;box-shadow:8px 8px 0 #e4ad28;">
    <tr><td style="padding:28px 24px 8px;text-align:center;">
      <div class="big" style="font:700 39px/42px Georgia;color:#45200a;">Your ritual is checked in.</div>
      <div style="width:150px;height:7px;background:#20a9b5;border-radius:9px;margin:14px auto 0;"></div>
      <div style="font:700 14px Arial;color:#7c5a36;margin-top:14px;">Receipt from LockHabit</div>
    </td></tr>
    <tr><td style="padding:12px 24px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stats">
        <tr>
          <td width="33.33%" align="center" style="padding:12px;border-right:1px solid #d7c7a9;"><div style="font:800 10px Arial;letter-spacing:1.5px;color:#45200a;">ORDER</div><div style="font:700 21px Georgia;color:#45200a;margin-top:6px;">${orderLabel}</div></td>
          <td width="33.33%" align="center" style="padding:12px;border-right:1px solid #d7c7a9;"><div style="font:800 10px Arial;letter-spacing:1.5px;color:#45200a;">PAID</div><div style="font:700 21px Georgia;color:#45200a;margin-top:6px;">${money(order.total, order.currency)}</div></td>
          <td width="33.33%" align="center" style="padding:12px;"><div style="font:800 10px Arial;letter-spacing:1.5px;color:#45200a;">STATUS</div><div style="font:900 14px Arial;color:#04747a;margin-top:8px;">CONFIRMED ✓</div></td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 24px 4px;">
      <div style="font:italic 700 28px Georgia;color:#04747a;">What’s in the bag</div>
      <div style="font:800 10px Arial;letter-spacing:3px;color:#45200a;margin-top:4px;">YOUR SUNNY ESSENTIALS</div>
    </td></tr>
    <tr><td style="padding:4px 24px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}
        <tr><td style="padding:9px 0 3px;font:14px Arial;color:#7c5a36;">Subtotal</td><td style="padding:9px 0 3px;text-align:right;font:14px Arial;color:#7c5a36;">${money(order.subtotal, order.currency)}</td></tr>
        <tr><td style="padding:3px 0;font:14px Arial;color:#7c5a36;">Shipping</td><td style="padding:3px 0;text-align:right;font:14px Arial;color:#7c5a36;">${order.shipping === 0 ? "Free" : money(order.shipping, order.currency)}</td></tr>
        <tr><td style="padding:3px 0 12px;font:14px Arial;color:#7c5a36;">Tax</td><td style="padding:3px 0 12px;text-align:right;font:14px Arial;color:#7c5a36;">${money(order.tax, order.currency)}</td></tr>
        <tr><td style="padding:14px 0;border-top:2px solid #45200a;font:900 18px Arial;color:#04747a;">TOTAL PAID</td><td style="padding:14px 0;border-top:2px solid #45200a;text-align:right;font:900 22px Arial;color:#04747a;">${money(order.total, order.currency)}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:12px 24px;">
      <div style="background:#5fd1c7;border:2px solid #45200a;padding:16px 18px;">
        <div style="font:900 10px Arial;letter-spacing:2px;color:#45200a;">SHIPPING TO</div>
        <div style="font:14px/21px Arial;color:#45200a;margin-top:7px;">${order.customerName ? `${escapeHtml(order.customerName)}<br>` : ""}${address || "Address confirmed at checkout"}</div>
      </div>
    </td></tr>
    <tr><td style="padding:18px 24px 28px;">
      <div style="font:italic 700 28px Georgia;color:#04747a;">Thanks for being here ♥</div>
      <div style="font:14px/21px Arial;color:#7c5a36;margin-top:8px;">Hi ${escapeHtml(firstName(order.customerName))}. Your soap is officially on the way to becoming part of the routine.</div>
      <a href="https://lockhabit.com/" class="cta" style="display:inline-block;margin-top:18px;background:#ffca0f;border:3px solid #45200a;border-radius:28px;padding:14px 24px;color:#45200a;text-decoration:none;font:900 13px Arial;letter-spacing:2px;box-shadow:5px 5px 0 #7d3b16;">BACK TO THE SOAP SHOP →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td class="pad" style="padding:20px 34px 28px;text-align:center;background:#f8edcf;">
  <div style="font:900 10px Arial;letter-spacing:4px;color:#45200a;">LOCKHABIT • GOOD HABITS • BRIGHTER DAYS</div>
  <div style="font:12px/18px Arial;color:#7c5a36;margin-top:10px;">Questions? Reply here or email <a href="mailto:${escapeHtml(supportEmail)}" style="color:#04747a;font-weight:700;">${escapeHtml(supportEmail)}</a>.</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    text: `Hi ${firstName(order.customerName)},

Your LockHabit order ${orderLabel} is confirmed.

${textItems}

Subtotal: ${money(order.subtotal, order.currency)}
Shipping: ${order.shipping === 0 ? "Free" : money(order.shipping, order.currency)}
Tax: ${money(order.tax, order.currency)}
Total paid: ${money(order.total, order.currency)}

Good habits. Brighter days.
Questions? ${supportEmail}`,
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
    const detail = payload.message?.trim();
    throw new Error(
      `Confirmation provider rejected the request (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return payload.id;
}
