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
  /** ISO timestamp of the successful payment (webhook event time). */
  paidAt: string | null;
  /** Promotion code the customer actually applied, if any. */
  discountCode: string | null;
  /** Total discount in minor units, straight from Stripe's total_details. */
  discountAmount: number;
  /** Short order descriptor shown under "Order Summary", e.g. "3-Bar Bundle". */
  orderKind: string;
};

const DEFAULT_ASSET_BASE = "https://lockhabit.com/email/receipt";
const SITE_URL = "https://lockhabit.com/";

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

export const formatPaidAt = (paidAt: string | null) => {
  if (!paidAt) return null;
  const date = new Date(paidAt);
  if (Number.isNaN(date.getTime())) return null;
  const options = { timeZone: "America/New_York" } as const;
  const day = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", ...options }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "medium", ...options }).format(date);
  return { day, time: `${time} ET`, label: `${day}, ${time} ET` };
};

const addressLine = (order: OrderConfirmation) => {
  const address = order.shippingAddress;
  if (!address) return null;
  const parts = [
    address["line1"],
    address["line2"],
    [address["city"], address["state"]].filter(Boolean).join(", "),
    address["postal_code"],
    address["country"],
  ].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length ? parts.join(" · ") : null;
};

// Palette lifted from the reference artwork.
const C = {
  page: "#fff8e7",
  sand: "#fde7b6",
  cream: "#fff3db",
  tableBg: "#fbf3e2",
  tableHead: "#f1e2c6",
  rule: "#d9c9ac",
  brown: "#310b00",
  ink: "#2d0802",
  teal: "#0c5c5f",
  yellow: "#f5ca3a",
};

// Every coloured cell repeats its colour three ways (bgcolor attribute, background-color,
// and a solid gradient) so Outlook mobile / Gmail dark mode cannot swap it for a dark tone.
const bg = (hex: string) =>
  `background-color:${hex};background:${hex};background-image:linear-gradient(${hex},${hex});`;
const ink = (hex: string) => `color:${hex};-webkit-text-fill-color:${hex};`;
// Same declarations with !important on each, for the dark-mode / Outlook override rules.
const bgForce = (hex: string) =>
  `background-color:${hex}!important;background:${hex}!important;background-image:linear-gradient(${hex},${hex})!important;`;
const inkForce = (hex: string) =>
  `color:${hex}!important;-webkit-text-fill-color:${hex}!important;`;
const sans = "font-family:Arial,Helvetica,sans-serif;";
const serif = "font-family:Georgia,'Times New Roman',Times,serif;";

export function renderOrderConfirmation(order: OrderConfirmation) {
  const assetBase = (process.env["LOCKHABIT_EMAIL_ASSET_BASE"] ?? DEFAULT_ASSET_BASE).replace(
    /\/+$/,
    "",
  );
  const asset = (file: string) => `${assetBase}/${file}`;
  const supportEmail = process.env["LOCKHABIT_SUPPORT_EMAIL"] ?? "support@lockhabit.com";
  const orderLabel = `LH-${String(order.orderNumber).padStart(6, "0")}`;
  const paidAt = formatPaidAt(order.paidAt);
  const paidAtLabel = paidAt?.label ?? null;
  const discount = Math.max(0, order.discountAmount);
  const discountLabel = order.discountCode
    ? `${escapeHtml(order.discountCode)} (${money(discount, order.currency)} off)`
    : `${money(discount, order.currency)} off`;
  const orderKindLabel = `LOCKHABIT ${order.orderKind}`.toUpperCase();
  const address = addressLine(order);
  const shipTo = address
    ? [order.customerName, address].filter((part): part is string => Boolean(part)).map(escapeHtml)
    : [];

  const cell = (extra = "") =>
    `class="t-brown cell" style="padding:9px 20px;${sans}font-size:15px;line-height:22px;${ink(C.ink)}${extra}"`;
  const cellRight = (extra = "") => cell(`text-align:right;${extra}`);

  const itemRows = order.items
    .map(
      (item, index) => `
        <tr>
          <td ${cell(`padding-top:${index === 0 ? 16 : 6}px;`)}>${escapeHtml(item.name)}&nbsp;&times;&nbsp;${item.quantity}</td>
          <td ${cellRight(`padding-top:${index === 0 ? 16 : 6}px;white-space:nowrap;`)}>${money(item.amountTotal, order.currency)}</td>
        </tr>`,
    )
    .join("");

  const totalsRows = [
    ["Subtotal", money(order.subtotal, order.currency), true],
    [
      "Shipping",
      order.shipping === 0 ? "Free shipping" : money(order.shipping, order.currency),
      true,
    ],
    ...(discount > 0
      ? [[order.discountCode ? "Discount code" : "Discount", discountLabel, false] as const]
      : []),
    ...(order.tax > 0 ? [["Tax", money(order.tax, order.currency), true] as const] : []),
  ]
    .map(
      ([label, value, nowrap], index) => `
        <tr>
          <td ${cell(`padding-top:${index === 0 ? 14 : 3}px;padding-bottom:3px;white-space:nowrap;`)}>${label}</td>
          <td ${cellRight(
            `padding-top:${index === 0 ? 14 : 3}px;padding-bottom:3px;${nowrap ? "white-space:nowrap;" : ""}`,
          )
            .replace(
              'class="t-brown cell"',
              nowrap ? 'class="t-brown cell"' : 'class="t-brown cell code"',
            )
            .replace("font-size:15px", nowrap ? "font-size:15px" : "font-size:14px")}>${value}</td>
        </tr>`,
    )
    .join("");

  const textItems = order.items
    .map((item) => `${item.name} × ${item.quantity} — ${money(item.amountTotal, order.currency)}`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<meta name="x-apple-disable-message-reformatting">
<title>Your LockHabit receipt ${orderLabel}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
:root{color-scheme:light only;supported-color-schemes:light only}
html,body{margin:0!important;padding:0!important;width:100%!important}
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse}
img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
u + #body a{color:inherit;text-decoration:none}
@media only screen and (max-width:640px){
  .shell{width:100%!important;max-width:100%!important}
  .card-pad{padding-left:6px!important;padding-right:6px!important}
  .inner-pad{padding-left:14px!important;padding-right:14px!important}
  .title{font-size:34px!important;line-height:38px!important;padding-top:24px!important}
  .stat{display:block!important;width:100%!important;border-right:0!important;border-bottom:1px solid ${C.rule}!important;padding:8px 0 10px!important;text-align:center!important}
  .stat-last{border-bottom:0!important}
  .cell{padding-left:12px!important;padding-right:12px!important;font-size:14px!important}
  .code{font-size:13px!important}
  .th-item{width:60%!important}
  .th-price{width:40%!important}
  .total-label{font-size:19px!important}
  .total-value{font-size:26px!important}
  .stamp-cell{display:none!important}
  .stamp-mobile{display:block!important;max-height:none!important;overflow:visible!important}
  .foliage{display:none!important}
  .stack{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important;text-align:center!important}
  .stack-copy{text-align:left!important;padding-bottom:18px!important}
  .thanks-img{width:100%!important;max-width:320px!important}
  .cta-cell{text-align:center!important}
  .cta{display:block!important;width:auto!important;text-align:center!important}
  .vacation{margin:12px auto 0!important}
  .kind{font-size:11px!important;letter-spacing:3px!important}
}
@media (prefers-color-scheme:dark){
  .bg-page{${bgForce(C.page)}}
  .bg-sand{${bgForce(C.sand)}}
  .bg-cream{${bgForce(C.cream)}}
  .bg-table{${bgForce(C.tableBg)}}
  .bg-thead{${bgForce(C.tableHead)}}
  .bg-yellow{${bgForce(C.yellow)}}
  .t-brown{${inkForce(C.ink)}}
  .t-teal{${inkForce(C.teal)}}
}
[data-ogsb] .bg-page,[data-ogsc] .bg-page{${bgForce(C.page)}}
[data-ogsb] .bg-sand,[data-ogsc] .bg-sand{${bgForce(C.sand)}}
[data-ogsb] .bg-cream,[data-ogsc] .bg-cream{${bgForce(C.cream)}}
[data-ogsb] .bg-table,[data-ogsc] .bg-table{${bgForce(C.tableBg)}}
[data-ogsb] .bg-thead,[data-ogsc] .bg-thead{${bgForce(C.tableHead)}}
[data-ogsb] .bg-yellow,[data-ogsc] .bg-yellow{${bgForce(C.yellow)}}
[data-ogsc] .t-brown{${inkForce(C.ink)}}
[data-ogsc] .t-teal{${inkForce(C.teal)}}
</style>
</head>
<body id="body" class="bg-page" bgcolor="${C.page}" style="margin:0;padding:0;${bg(C.page)}">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Receipt ${orderLabel} — ${money(order.total, order.currency)} paid. Good habits, brighter days.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-page" bgcolor="${C.page}" style="width:100%;${bg(C.page)}">
<tr><td align="center" valign="top" style="padding:0;">
<!--[if mso]><table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="center" class="shell bg-sand" bgcolor="${C.sand}" style="width:640px;max-width:640px;margin:0 auto;${bg(C.sand)}">

  <!-- Tropical postcard header -->
  <tr>
    <td class="bg-sand" bgcolor="${C.sand}" style="padding:0;line-height:0;font-size:0;${bg(C.sand)}">
      <img src="${asset("receipt-header.jpg")}" width="640" alt="LockHabit — Good Habits, Brighter Days" style="display:block;width:100%;max-width:640px;height:auto;border:0;">
    </td>
  </tr>

  <!-- Receipt card -->
  <tr>
    <td class="bg-sand card-pad" bgcolor="${C.sand}" style="padding:0 8px 14px;${bg(C.sand)}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-cream" bgcolor="${C.cream}" style="width:100%;${bg(C.cream)}border:3px solid ${C.brown};border-radius:26px;">

        <tr>
          <td align="center" class="bg-cream title t-brown" bgcolor="${C.cream}" style="padding:32px 24px 8px;${bg(C.cream)}${serif}font-size:46px;line-height:50px;font-weight:700;letter-spacing:-0.5px;${ink(C.ink)}">Receipt from lockhabit</td>
        </tr>
        <tr>
          <td align="center" class="bg-cream" bgcolor="${C.cream}" style="padding:0 24px 12px;line-height:0;font-size:0;${bg(C.cream)}">
            <img src="${asset("receipt-squiggle.png")}" width="140" height="30" alt="" style="display:inline-block;width:140px;height:30px;border:0;">
          </td>
        </tr>

        <!-- Payment summary -->
        <tr>
          <td class="bg-cream inner-pad" bgcolor="${C.cream}" style="padding:6px 22px 4px;${bg(C.cream)}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="stat" width="31%" align="center" valign="top" style="padding:10px 6px 12px;border-right:1px solid ${C.brown};">
                  <div class="t-brown" style="${sans}font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.6px;${ink(C.ink)}">RECEIPT NUMBER</div>
                  <div class="t-brown" style="margin-top:6px;${serif}font-size:22px;line-height:26px;font-weight:700;${ink(C.ink)}">${orderLabel}</div>
                </td>
                <td class="stat" width="24%" align="center" valign="top" style="padding:10px 6px 12px;border-right:1px solid ${C.brown};">
                  <div class="t-brown" style="${sans}font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.6px;${ink(C.ink)}">AMOUNT PAID</div>
                  <div class="t-brown" style="margin-top:6px;${serif}font-size:26px;line-height:28px;font-weight:700;${ink(C.ink)}">${money(order.total, order.currency)}</div>
                </td>
                <td class="stat stat-last" align="center" valign="top" style="padding:10px 6px 12px;white-space:nowrap;">
                  <div class="t-brown" style="${sans}font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.6px;${ink(C.ink)}">DATE PAID</div>
                  <div class="t-brown" style="margin-top:6px;${sans}font-size:18px;line-height:24px;font-weight:500;${ink(C.ink)}">${paidAt ? `${escapeHtml(paidAt.day)},<br>${escapeHtml(paidAt.time)}` : "Confirmed by Stripe"}</div>
                </td>
                <td class="stamp-cell" width="104" align="right" valign="top" style="padding:0 0 0 4px;line-height:0;font-size:0;">
                  <img src="${asset("receipt-stamp.png")}" width="100" alt="Good Habits · Brighter Days" style="display:block;width:100px;height:auto;border:0;">
                </td>
              </tr>
            </table>
            <!--[if !mso]><!-->
            <div class="stamp-mobile" style="display:none;max-height:0;overflow:hidden;text-align:center;padding-top:10px;">
              <img src="${asset("receipt-stamp.png")}" width="96" alt="" style="display:inline-block;width:96px;height:auto;border:0;">
            </div>
            <!--<![endif]-->
          </td>
        </tr>

        <!-- Order summary heading -->
        <tr>
          <td class="bg-cream inner-pad" bgcolor="${C.cream}" style="padding:10px 22px 0;${bg(C.cream)}">
            <img src="${asset("receipt-order-summary.png")}" width="228" alt="Order Summary" style="display:block;width:228px;max-width:100%;height:auto;border:0;">
            <div class="t-brown kind" style="padding:4px 0 0 30px;${sans}font-size:13px;line-height:18px;font-weight:700;letter-spacing:4px;${ink(C.ink)}">${escapeHtml(orderKindLabel)}</div>
          </td>
        </tr>

        <!-- Order table -->
        <tr>
          <td class="bg-cream inner-pad" bgcolor="${C.cream}" style="padding:16px 22px 10px;${bg(C.cream)}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-table" bgcolor="${C.tableBg}" style="width:100%;table-layout:fixed;${bg(C.tableBg)}border:1px solid #e6d7bb;border-radius:14px;">
              <tr>
                <td class="bg-thead t-brown th-item" bgcolor="${C.tableHead}" width="55%" style="width:55%;padding:13px 20px;${bg(C.tableHead)}border-radius:13px 0 0 0;${sans}font-size:12px;line-height:16px;font-weight:700;letter-spacing:2px;${ink(C.ink)}">ITEM</td>
                <td class="bg-thead t-brown th-price" bgcolor="${C.tableHead}" width="45%" align="right" style="width:45%;padding:13px 20px;${bg(C.tableHead)}border-radius:0 13px 0 0;text-align:right;${sans}font-size:12px;line-height:16px;font-weight:700;letter-spacing:2px;${ink(C.ink)}">PRICE</td>
              </tr>
              ${itemRows}
              <tr><td colspan="2" style="padding:10px 20px 0;"><div style="height:1px;line-height:1px;font-size:1px;${bg(C.rule)}">&nbsp;</div></td></tr>
              ${totalsRows}
              <tr><td colspan="2" style="padding:12px 20px 0;"><div style="height:2px;line-height:2px;font-size:2px;${bg(C.brown)}">&nbsp;</div></td></tr>
              <tr>
                <td class="t-teal cell total-label" style="padding:14px 20px 18px;white-space:nowrap;${sans}font-size:22px;line-height:28px;font-weight:700;${ink(C.teal)}">Amount paid</td>
                <td class="t-teal cell total-value" align="right" style="padding:14px 20px 18px;text-align:right;white-space:nowrap;${sans}font-size:30px;line-height:32px;font-weight:700;${ink(C.teal)}">${money(order.total, order.currency)}</td>
              </tr>
            </table>
          </td>
        </tr>

        ${
          shipTo.length
            ? `<!-- Compact shipping line -->
        <tr>
          <td class="bg-cream inner-pad" bgcolor="${C.cream}" style="padding:2px 22px 0;${bg(C.cream)}">
            <div class="t-brown" style="padding:0 8px;${sans}font-size:12px;line-height:18px;${ink(C.ink)}"><span style="font-weight:700;letter-spacing:1.5px;">SHIPPING TO</span>&nbsp;&nbsp;${shipTo.join(" · ")}</div>
          </td>
        </tr>`
            : ""
        }

        <!-- Thank-you + CTA -->
        <tr>
          <td class="bg-cream" bgcolor="${C.cream}" style="padding:18px 0 0;${bg(C.cream)}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="foliage" width="56" valign="bottom" style="padding:0;line-height:0;font-size:0;">
                  <img src="${asset("receipt-foliage-left.png")}" width="56" alt="" style="display:block;width:56px;height:auto;border:0;">
                </td>
                <td class="stack stack-copy inner-pad" valign="top" style="padding:0 10px 18px 8px;">
                  <img src="${asset("receipt-thanks.png")}" width="300" alt="Thanks for being here" class="thanks-img" style="display:block;width:300px;max-width:100%;height:auto;border:0;">
                  <div class="t-brown" style="padding:10px 0 0 30px;${sans}font-size:14px;line-height:21px;${ink(C.ink)}">You’re not just buying products — you’re investing in a brighter you. Here’s to better habits and brighter days.</div>
                </td>
                <td class="stack cta-cell inner-pad" width="200" valign="top" align="right" style="padding:6px 22px 18px 0;text-align:right;">
                  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${SITE_URL}" style="height:48px;v-text-anchor:middle;width:178px;" arcsize="8%" strokecolor="${C.yellow}" fillcolor="${C.yellow}"><w:anchorlock/><center style="color:${C.brown};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;letter-spacing:2px;">KEEP GOING &rarr;</center></v:roundrect><![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${SITE_URL}" class="cta bg-yellow" style="display:inline-block;white-space:nowrap;${bg(C.yellow)}${ink(C.brown)}text-decoration:none;${sans}font-size:16px;line-height:24px;font-weight:700;letter-spacing:2px;padding:12px 20px;border-radius:4px 10px 4px 12px;mso-hide:all;">KEEP GOING &rarr;</a>
                  <!--<![endif]-->
                  <img src="${asset("receipt-vacation.png")}" width="128" alt="Vacation Mode For A Better You" class="vacation" style="display:block;width:128px;height:auto;border:0;margin:10px 0 0 auto;">
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Turquoise wave footer -->
        <tr>
          <td class="bg-cream" bgcolor="${C.cream}" style="padding:0;line-height:0;font-size:0;${bg(C.cream)}">
            <img src="${asset("receipt-footer.jpg")}" width="612" alt="LOCKHABIT — Good Habits · Brighter Days" style="display:block;width:100%;height:auto;border:0;border-radius:0 0 22px 22px;">
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- Support -->
  <tr>
    <td align="center" class="bg-sand t-brown" bgcolor="${C.sand}" style="padding:2px 24px 22px;${bg(C.sand)}${sans}font-size:12px;line-height:18px;${ink(C.ink)}">
      Questions about your order?<br>Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="${ink(C.teal)}font-weight:700;text-decoration:underline;">${escapeHtml(supportEmail)}</a>
    </td>
  </tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;

  const text = `Receipt from LockHabit

Receipt number: ${orderLabel}
Amount paid: ${money(order.total, order.currency)}
${paidAtLabel ? `Date paid: ${paidAtLabel}\n` : ""}
ORDER SUMMARY — ${orderKindLabel}
${textItems}

Subtotal: ${money(order.subtotal, order.currency)}
Shipping: ${order.shipping === 0 ? "Free shipping" : money(order.shipping, order.currency)}
${discount > 0 ? `${order.discountCode ? "Discount code" : "Discount"}: ${order.discountCode ? `${order.discountCode} ` : ""}(${money(discount, order.currency)} off)\n` : ""}${order.tax > 0 ? `Tax: ${money(order.tax, order.currency)}\n` : ""}Amount paid: ${money(order.total, order.currency)}
${shipTo.length ? `\nShipping to: ${[order.customerName, address].filter(Boolean).join(" · ")}\n` : ""}
Thanks for being here. You’re not just buying products — you’re investing in a brighter you. Here’s to better habits and brighter days.

Keep going: ${SITE_URL}

Questions about your order? Reply to this email or contact ${supportEmail}`;

  return {
    subject: `Your LockHabit receipt • ${orderLabel}`,
    html,
    text,
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
