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
  const discount = Math.max(0, order.subtotal + order.shipping + order.tax - order.total);
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:15px 18px;border-bottom:1px solid #e4d3ad;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;font-weight:700;color:#2f1308;-webkit-text-fill-color:#2f1308;">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:15px 18px;border-bottom:1px solid #e4d3ad;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;font-weight:700;color:#2f1308;-webkit-text-fill-color:#2f1308;white-space:nowrap;">${money(item.amountTotal, order.currency)}</td>
    </tr>`).join("");

  const address = addressLines(order.shippingAddress).map(escapeHtml).join("<br>");
  const textItems = order.items.map((item) => `${item.name} × ${item.quantity} — ${money(item.amountTotal, order.currency)}`).join("\n");

  const cream = "#fff4d7";
  const cream2 = "#fff9e8";
  const brown = "#3f1808";
  const teal = "#0d8f96";
  const tealDark = "#075d63";
  const aqua = "#58d7d1";
  const yellow = "#f9c62d";
  const coral = "#f46e58";

  return {
    subject: `Your LockHabit receipt • ${orderLabel}`,
    html: `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<style>
:root { color-scheme: light only !important; supported-color-schemes: light only !important; }
body,table,td,a,p,div,span { -webkit-text-size-adjust:100%; }
@media only screen and (max-width:640px){
  .shell{width:100%!important;max-width:100%!important}
  .pad{padding-left:18px!important;padding-right:18px!important}
  .hero-side{display:none!important}
  .hero-logo{width:260px!important;max-width:75%!important}
  .receipt-title{font-size:35px!important;line-height:38px!important}
  .stats td{display:block!important;width:100%!important;border-right:0!important;border-bottom:1px solid #d7c8a7!important;padding:12px 0!important}
  .thanks-copy,.thanks-cta{display:block!important;width:100%!important;text-align:left!important}
  .thanks-cta{padding-top:16px!important}
  .cta{display:block!important;text-align:center!important}
}
@media (prefers-color-scheme: dark){
  .force-cream{background:#fff4d7!important;background-image:linear-gradient(#fff4d7,#fff4d7)!important}
  .force-cream2{background:#fff9e8!important;background-image:linear-gradient(#fff9e8,#fff9e8)!important}
  .force-teal{background:#58d7d1!important;background-image:linear-gradient(#58d7d1,#58d7d1)!important}
  .force-aqua{background:#18c7c8!important;background-image:linear-gradient(#18c7c8,#18c7c8)!important}
  .force-brown{color:#3f1808!important;-webkit-text-fill-color:#3f1808!important}
  .force-tealtext{color:#075d63!important;-webkit-text-fill-color:#075d63!important}
}
[data-ogsc] .force-cream{background:#fff4d7!important;background-image:linear-gradient(#fff4d7,#fff4d7)!important}
[data-ogsc] .force-cream2{background:#fff9e8!important;background-image:linear-gradient(#fff9e8,#fff9e8)!important}
[data-ogsc] .force-teal{background:#58d7d1!important;background-image:linear-gradient(#58d7d1,#58d7d1)!important}
[data-ogsc] .force-aqua{background:#18c7c8!important;background-image:linear-gradient(#18c7c8,#18c7c8)!important}
[data-ogsc] .force-brown{color:#3f1808!important;-webkit-text-fill-color:#3f1808!important}
[data-ogsc] .force-tealtext{color:#075d63!important;-webkit-text-fill-color:#075d63!important}
</style>
</head>
<body style="margin:0;padding:0;background:#111111;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Order ${orderLabel} is confirmed. Your LockHabit ritual is officially checked in.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111111" style="width:100%;margin:0;padding:0;background:#111111;">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" class="shell" bgcolor="${cream}" style="width:640px;max-width:640px;background:${cream};background-image:linear-gradient(${cream},${cream});border:3px solid ${brown};">

<!-- tropical hero -->
<tr>
<td
  background="https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-hero.jpg"
  bgcolor="#7edbd5"
  style="background-color:#7edbd5;background-image:url('https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-hero.jpg');background-position:center center;background-size:cover;padding:24px 18px 26px;border-bottom:3px solid ${brown};"
>
  <!--[if gte mso 9]>
  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;height:270px;">
    <v:fill type="frame" src="https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-hero.jpg" color="#7edbd5"/>
    <v:textbox inset="0,0,0,0">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="24%" class="hero-side" valign="middle" style="padding:0 8px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td bgcolor="#f4d697" style="padding:5px 10px;border:2px solid ${brown};font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">BETTER</td></tr>
          <tr><td height="4"></td></tr>
          <tr><td bgcolor="#f4d697" style="padding:5px 10px;border:2px solid ${brown};font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">HABITS</td></tr>
          <tr><td height="4"></td></tr>
          <tr><td bgcolor="#f4d697" style="padding:5px 10px;border:2px solid ${brown};font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">BRIGHTER</td></tr>
          <tr><td height="4"></td></tr>
          <tr><td bgcolor="#f4d697" style="padding:5px 10px;border:2px solid ${brown};font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">DAYS</td></tr>
        </table>
      </td>
      <td width="52%" align="center" valign="middle">
        <img class="hero-logo" src="https://raw.githubusercontent.com/oralrobinson21/lockhabit-site/main/src/assets/lockhabit-logo-transparent.png" width="290" alt="LockHabit" style="display:block;width:290px;max-width:100%;height:auto;margin:0 auto;border:0;">
        <div style="margin-top:8px;font-family:Arial,sans-serif;font-size:11px;line-height:16px;font-weight:900;letter-spacing:5px;color:#ffffff;-webkit-text-fill-color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,.35);">GOOD HABITS<br>BRIGHTER DAYS</div>
      </td>
      <td width="24%" class="hero-side" align="right" valign="middle" style="padding-left:8px;">
        <div style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:22px;line-height:23px;font-weight:700;color:${brown};-webkit-text-fill-color:${brown};transform:rotate(-4deg);">Small<br>Habits<br>A Brighter<br>You</div>
        <div style="width:70px;height:4px;background:${coral};margin:7px 0 0 auto;"></div>
      </td>
    </tr>
  </table>
  <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
</td>
</tr>

<!-- receipt card -->
<tr>
<td class="force-cream pad" bgcolor="${cream}" style="padding:18px 18px 0;background:${cream};background-image:linear-gradient(${cream},${cream});">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="force-cream2" bgcolor="${cream2}" style="width:100%;background:${cream2};background-image:linear-gradient(${cream2},${cream2});border:3px solid ${brown};border-radius:22px;">
    <tr><td align="center" class="force-cream2" bgcolor="${cream2}" style="padding:25px 20px 14px;background:${cream2};background-image:linear-gradient(${cream2},${cream2});">
      <div class="receipt-title force-brown" style="font-family:Georgia,'Times New Roman',serif;font-size:41px;line-height:45px;font-weight:700;color:${brown};-webkit-text-fill-color:${brown};">Receipt from LockHabit</div>
      <div style="font-family:Arial,sans-serif;font-size:29px;line-height:20px;font-weight:900;letter-spacing:7px;color:#13aeb0;-webkit-text-fill-color:#13aeb0;margin-top:7px;">~~~~</div>
    </td></tr>

    <tr><td class="force-cream2" bgcolor="${cream2}" style="padding:4px 20px 12px;background:${cream2};background-image:linear-gradient(${cream2},${cream2});">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="stats">
        <tr>
          <td width="33.33%" align="center" style="padding:10px 8px;border-right:1px solid #a89672;">
            <div class="force-brown" style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.6px;color:${brown};-webkit-text-fill-color:${brown};">RECEIPT NUMBER</div>
            <div class="force-brown" style="margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;color:${brown};-webkit-text-fill-color:${brown};">${orderLabel}</div>
          </td>
          <td width="33.33%" align="center" style="padding:10px 8px;border-right:1px solid #a89672;">
            <div class="force-brown" style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.6px;color:${brown};-webkit-text-fill-color:${brown};">AMOUNT PAID</div>
            <div class="force-brown" style="margin-top:6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:${brown};-webkit-text-fill-color:${brown};">${money(order.total, order.currency)}</div>
          </td>
          <td width="33.33%" align="center" style="padding:10px 8px;">
            <div class="force-brown" style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.6px;color:${brown};-webkit-text-fill-color:${brown};">STATUS</div>
            <div class="force-tealtext" style="margin-top:7px;font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:${tealDark};-webkit-text-fill-color:${tealDark};">CONFIRMED ✓</div>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td class="force-cream2" bgcolor="${cream2}" style="padding:6px 20px 0;background:${cream2};background-image:linear-gradient(${cream2},${cream2});">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">
            <div class="force-tealtext" style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:34px;line-height:34px;font-weight:700;color:${tealDark};-webkit-text-fill-color:${tealDark};transform:rotate(-2deg);">Order Summary</div>
            <div class="force-brown" style="margin-top:6px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:4px;color:${brown};-webkit-text-fill-color:${brown};">LOCKHABIT ORDER</div>
          </td>
          <td width="92" align="center" valign="middle">
            <table role="presentation" width="78" height="78" cellpadding="0" cellspacing="0" border="0" style="border:3px solid ${tealDark};border-radius:50%;">
              <tr><td align="center" valign="middle" class="force-tealtext" style="font-family:Arial,sans-serif;font-size:9px;line-height:13px;font-weight:900;letter-spacing:1px;color:${tealDark};-webkit-text-fill-color:${tealDark};">GOOD HABITS<br>✦ PALM ✦<br>BRIGHTER DAYS</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td class="force-cream2" bgcolor="${cream2}" style="padding:12px 20px 8px;background:${cream2};background-image:linear-gradient(${cream2},${cream2});">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffaf0" style="background:#fffaf0;background-image:linear-gradient(#fffaf0,#fffaf0);border:1px solid #ead9b8;border-radius:12px;overflow:hidden;">
        <tr bgcolor="#f1dfbd">
          <td class="force-brown" style="padding:10px 18px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">ITEM</td>
          <td class="force-brown" style="padding:10px 18px;text-align:right;font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:${brown};-webkit-text-fill-color:${brown};">PRICE</td>
        </tr>
        ${itemRows}
        <tr><td class="force-brown" style="padding:9px 18px 3px;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">Subtotal</td><td class="force-brown" style="padding:9px 18px 3px;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">${money(order.subtotal, order.currency)}</td></tr>
        <tr><td class="force-brown" style="padding:3px 18px;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">Shipping</td><td class="force-brown" style="padding:3px 18px;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">${order.shipping === 0 ? "Free shipping" : money(order.shipping, order.currency)}</td></tr>
        ${discount > 0 ? `<tr><td class="force-brown" style="padding:3px 18px;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">Discount</td><td class="force-brown" style="padding:3px 18px;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">−${money(discount, order.currency)}</td></tr>` : ""}
        <tr><td class="force-brown" style="padding:3px 18px 12px;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">Tax</td><td class="force-brown" style="padding:3px 18px 12px;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:${brown};-webkit-text-fill-color:${brown};">${money(order.tax, order.currency)}</td></tr>
        <tr><td class="force-tealtext" style="padding:14px 18px;border-top:2px solid ${tealDark};font-family:Arial,sans-serif;font-size:19px;font-weight:900;color:${tealDark};-webkit-text-fill-color:${tealDark};">Amount paid</td><td class="force-tealtext" style="padding:14px 18px;border-top:2px solid ${tealDark};text-align:right;font-family:Arial,sans-serif;font-size:25px;font-weight:900;color:${tealDark};-webkit-text-fill-color:${tealDark};">${money(order.total, order.currency)}</td></tr>
      </table>
    </td></tr>

    <tr><td class="force-cream2" bgcolor="${cream2}" style="padding:18px 20px 24px;background:${cream2};background-image:linear-gradient(${cream2},${cream2});">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="thanks-copy" width="62%" valign="top">
            <div class="force-tealtext" style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:34px;line-height:36px;font-weight:700;color:${tealDark};-webkit-text-fill-color:${tealDark};transform:rotate(-2deg);">Thanks for being here <span style="color:${coral};-webkit-text-fill-color:${coral};">♡</span></div>
            <div class="force-brown" style="margin-top:9px;font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:${brown};-webkit-text-fill-color:${brown};">Hi ${escapeHtml(firstName(order.customerName))}. You’re not just buying products — you’re building a brighter routine. Here’s to better habits and brighter days.</div>
          </td>
          <td class="thanks-cta" width="38%" valign="middle" align="right" style="padding-left:16px;">
            <a href="https://lockhabit.com/" class="cta" style="display:inline-block;background:${yellow};background-image:linear-gradient(${yellow},${yellow});border:3px solid ${brown};padding:15px 18px;color:${brown};-webkit-text-fill-color:${brown};text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;transform:rotate(-2deg);">KEEP GOING →</a>
            <div class="force-tealtext" style="margin-top:14px;font-family:'Brush Script MT','Segoe Script',cursive;font-size:20px;line-height:21px;color:${tealDark};-webkit-text-fill-color:${tealDark};">Vacation Mode<br>For A Better You</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</td>
</tr>

<!-- shipping card -->
<tr><td class="force-cream pad" bgcolor="${cream}" style="padding:18px 38px 0;background:${cream};background-image:linear-gradient(${cream},${cream});">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff9e8" style="background:#fff9e8;background-image:linear-gradient(#fff9e8,#fff9e8);border:2px solid ${brown};">
    <tr><td style="padding:14px 16px;">
      <div class="force-brown" style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:2px;color:${brown};-webkit-text-fill-color:${brown};">SHIPPING TO</div>
      <div class="force-brown" style="margin-top:7px;font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:${brown};-webkit-text-fill-color:${brown};">${order.customerName ? `${escapeHtml(order.customerName)}<br>` : ""}${address || "Address confirmed at checkout"}</div>
    </td></tr>
  </table>
</td></tr>

<!-- bright turquoise footer -->
<tr><td class="force-cream" bgcolor="${cream}" style="padding-top:20px;background:${cream};background-image:linear-gradient(${cream},${cream});">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="force-aqua" bgcolor="#18c7c8" style="background:#18c7c8;background-image:linear-gradient(#18c7c8,#18c7c8);border-top:3px solid ${brown};">
    <tr><td align="center" style="padding:24px 20px 12px;">
      <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:900;letter-spacing:7px;color:#ffffff;-webkit-text-fill-color:#ffffff;">LOCKHABIT</div>
      <div style="margin-top:10px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:4px;color:${brown};-webkit-text-fill-color:${brown};">GOOD HABITS &nbsp; ✦ &nbsp; BRIGHTER DAYS</div>
    </td></tr>
    <tr><td align="center" bgcolor="#fff0c8" style="padding:12px 20px 18px;background:#fff0c8;background-image:linear-gradient(#fff0c8,#fff0c8);">
      <div class="force-brown" style="font-family:Arial,sans-serif;font-size:11px;line-height:17px;color:${brown};-webkit-text-fill-color:${brown};">Questions? Reply here or email <a href="mailto:${escapeHtml(supportEmail)}" style="color:${tealDark};-webkit-text-fill-color:${tealDark};font-weight:800;">${escapeHtml(supportEmail)}</a>.</div>
    </td></tr>
  </table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
    text: `Hi ${firstName(order.customerName)},

Your LockHabit order ${orderLabel} is confirmed.

${textItems}

Subtotal: ${money(order.subtotal, order.currency)}
${discount > 0 ? `Discount: -${money(discount, order.currency)}\n` : ""}Shipping: ${order.shipping === 0 ? "Free shipping" : money(order.shipping, order.currency)}
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
