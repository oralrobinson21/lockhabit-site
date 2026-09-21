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
  const paidAt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date());

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #d8c8ab;color:#42210b;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">
            ${escapeHtml(item.name)} × ${item.quantity}
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #d8c8ab;text-align:right;color:#42210b;font-family:Arial,sans-serif;font-size:15px;white-space:nowrap;">
            ${money(item.amountTotal, order.currency)}
          </td>
        </tr>`,
    )
    .join("");

  const address = addressLines(order.shippingAddress).map(escapeHtml).join("<br>");
  const textItems = order.items
    .map((item) => `${item.name} × ${item.quantity} — ${money(item.amountTotal, order.currency)}`)
    .join("\n");

  return {
    subject: `Your LockHabit receipt • ${orderLabel}`,
    html: `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    @media only screen and (max-width: 640px) {
      .email-shell { width: 100% !important; }
      .pad { padding-left: 18px !important; padding-right: 18px !important; }
      .hero-title { font-size: 40px !important; line-height: 40px !important; }
      .receipt-title { font-size: 31px !important; line-height: 35px !important; }
      .stat-cell { display: block !important; width: 100% !important; border-right: 0 !important; border-bottom: 1px solid #d8c8ab !important; padding: 12px 0 !important; }
      .cta { display:block !important; width:auto !important; text-align:center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#111111;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Order ${orderLabel} is confirmed. Your LockHabit ritual is officially checked in.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#111111;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:640px;max-width:640px;background:#f8edcf;border-left:2px solid #42210b;border-right:2px solid #42210b;">

          <tr>
            <td style="background:#54d0c6;border-bottom:4px solid #42210b;padding:0;">
              <img
                src="https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-hero.jpg"
                width="640"
                alt="LockHabit tropical soap ritual"
                style="display:block;width:100%;max-width:640px;height:auto;border:0;"
              >
            </td>
          </tr>

          <tr>
            <td class="pad" style="padding:28px 34px 12px;background:#f8edcf;text-align:center;">
              <img
                src="https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-logo-transparent.png"
                width="230"
                alt="LockHabit Soap & Body Care"
                style="display:block;width:230px;max-width:72%;height:auto;margin:0 auto 8px;border:0;"
              >
              <div style="font-family:Trebuchet MS,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:5px;color:#42210b;text-transform:uppercase;">
                GOOD HABITS &nbsp; • &nbsp; BRIGHTER DAYS
              </div>
            </td>
          </tr>

          <tr>
            <td class="pad" style="padding:14px 34px 0;background:#f8edcf;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:3px solid #42210b;border-radius:22px;background:#fff7df;box-shadow:8px 8px 0 #e7b83f;">
                <tr>
                  <td style="padding:28px 24px 18px;text-align:center;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:42px;font-weight:700;color:#42210b;" class="receipt-title">
                      Receipt from LockHabit
                    </div>
                    <div style="margin:14px auto 0;width:160px;height:7px;background:#22aeb5;border-radius:8px;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 24px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td class="stat-cell" width="33.33%" align="center" style="padding:12px 10px;border-right:1px solid #d8c8ab;">
                          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.6px;color:#42210b;">RECEIPT NUMBER</div>
                          <div style="margin-top:7px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#42210b;">${orderLabel}</div>
                        </td>
                        <td class="stat-cell" width="33.33%" align="center" style="padding:12px 10px;border-right:1px solid #d8c8ab;">
                          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.6px;color:#42210b;">AMOUNT PAID</div>
                          <div style="margin-top:7px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#42210b;">${money(order.total, order.currency)}</div>
                        </td>
                        <td class="stat-cell" width="33.33%" align="center" style="padding:12px 10px;">
                          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.6px;color:#42210b;">DATE PAID</div>
                          <div style="margin-top:7px;font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#42210b;">${escapeHtml(paidAt)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:2px 24px 10px;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;font-weight:700;color:#04747a;">Order Summary</div>
                    <div style="margin-top:5px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:4px;color:#42210b;text-transform:uppercase;">YOUR SUNNY ESSENTIALS</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 24px 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4ead4;border:1px solid #e0d0af;border-radius:12px;overflow:hidden;">
                      <tr style="background:#eadcc0;">
                        <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#42210b;">ITEM</td>
                        <td style="padding:10px 12px;text-align:right;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#42210b;">PRICE</td>
                      </tr>
                      ${itemRows}
                      <tr>
                        <td style="padding:8px 12px 4px;font-family:Arial,sans-serif;color:#6a4a35;">Subtotal</td>
                        <td style="padding:8px 12px 4px;text-align:right;font-family:Arial,sans-serif;color:#6a4a35;">${money(order.subtotal, order.currency)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px;font-family:Arial,sans-serif;color:#6a4a35;">Shipping</td>
                        <td style="padding:4px 12px;text-align:right;font-family:Arial,sans-serif;color:#6a4a35;">${order.shipping === 0 ? "Free" : money(order.shipping, order.currency)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px 10px;font-family:Arial,sans-serif;color:#6a4a35;">Tax</td>
                        <td style="padding:4px 12px 10px;text-align:right;font-family:Arial,sans-serif;color:#6a4a35;">${money(order.tax, order.currency)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 12px;border-top:2px solid #42210b;font-family:Arial,sans-serif;font-size:19px;font-weight:800;color:#075e63;">Amount paid</td>
                        <td style="padding:14px 12px;border-top:2px solid #42210b;text-align:right;font-family:Arial,sans-serif;font-size:24px;font-weight:900;color:#075e63;">${money(order.total, order.currency)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px 6px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:16px 18px;background:#56d2c6;border:2px solid #42210b;">
                          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;color:#42210b;text-transform:uppercase;">SHIPPING TO</div>
                          <div style="margin-top:8px;font-family:Arial,sans-serif;font-size:14px;line-height:21px;color:#42210b;">
                            ${order.customerName ? `${escapeHtml(order.customerName)}<br>` : ""}${address}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 26px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:28px;font-weight:700;color:#075e63;">Thanks for being here ♥</div>
                          <div style="margin-top:8px;font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#6a4a35;">
                            Hi ${escapeHtml(firstName(order.customerName))}. Your ritual is checked in. We’ll take it from here.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:18px;">
                          <a href="https://lockhabit.com/" class="cta" style="display:inline-block;background:#ffc91b;border:3px solid #42210b;border-radius:28px;padding:14px 25px;color:#42210b;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;box-shadow:5px 5px 0 #7d3b16;">
                            KEEP GOING →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="pad" style="padding:22px 34px 30px;background:#f8edcf;text-align:center;">
              <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:900;letter-spacing:5px;color:#42210b;text-transform:uppercase;">
                LOCKHABIT &nbsp; • &nbsp; GOOD HABITS &nbsp; • &nbsp; BRIGHTER DAYS
              </div>
              <div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;line-height:18px;color:#79543c;">
                Questions? Reply to this email or contact
                <a style="color:#075e63;font-weight:700;" href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi ${firstName(order.customerName)},

Your LockHabit order ${orderLabel} is confirmed.

${textItems}

Subtotal: ${money(order.subtotal, order.currency)}
Shipping: ${order.shipping === 0 ? "Free" : money(order.shipping, order.currency)}
Tax: ${money(order.tax, order.currency)}
Total paid: ${money(order.total, order.currency)}

Shipping to:
${order.customerName ? `${order.customerName}\n` : ""}${addressLines(order.shippingAddress).join("\n")}

Good habits. Brighter days.
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
    const detail = payload.message?.trim();
    throw new Error(
      `Confirmation provider rejected the request (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return payload.id;
}
