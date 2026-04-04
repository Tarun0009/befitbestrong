import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "BeFitBeStrong <noreply@befitbestrong.com>";

// ── Shared HTML shell ───────────────────────────────────────────────────────

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'DM Sans',Arial,sans-serif;color:#F2F2F7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#1C1C1E;border-bottom:3px solid #FF5500;padding:28px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <span style="font-size:28px;font-weight:900;letter-spacing:3px;color:#F2F2F7;text-transform:uppercase;">
                BeFit<span style="color:#FF5500;">Be</span>Strong
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#1C1C1E;padding:40px;border-radius:0 0 12px 12px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#8E8E93;font-size:12px;line-height:1.6;">
                &copy; ${new Date().getFullYear()} BeFitBeStrong. All rights reserved.<br />
                <a href="https://befitbestrong.com" style="color:#FF5500;text-decoration:none;">befitbestrong.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;letter-spacing:1px;color:#F2F2F7;text-transform:uppercase;">${text}</h1>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #2C2C2E;margin:24px 0;" />`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#FF5500;color:#fff;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:8px;margin-top:16px;">${label}</a>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:8px 0;color:#8E8E93;font-size:13px;width:40%;">${label}</td>
    <td style="padding:8px 0;color:#F2F2F7;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;
}

// ── Welcome Email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const body = `
    ${heading("Welcome to the tribe!")}
    <p style="margin:16px 0 0;color:#8E8E93;font-size:15px;line-height:1.7;">
      Hey <strong style="color:#F2F2F7;">${name}</strong>,<br /><br />
      You've just joined thousands of athletes who train hard and live harder. Your BeFitBeStrong account is ready.
    </p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:12px;background:#2C2C2E;border-radius:8px;text-align:center;margin-bottom:12px;">
          <p style="margin:0;color:#FF5500;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your starter perks</p>
          <p style="margin:8px 0 0;color:#F2F2F7;font-size:14px;">Free shipping on your first order over ₹999</p>
        </td>
      </tr>
    </table>
    <br />
    ${button("Shop Now", "https://befitbestrong.com/products")}
    ${divider()}
    <p style="margin:0;color:#8E8E93;font-size:12px;line-height:1.6;">
      Questions? Reply to this email — we're always here.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to BeFitBeStrong — Let's Get to Work",
    html: shell("Welcome to BeFitBeStrong", body),
  });
}

// ── Order Confirmation Email ────────────────────────────────────────────────

interface OrderEmailData {
  orderNumber: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  gst: number;
  discount?: number;
  paymentMethod: string;
  items: { productName: string; variantTitle?: string; quantity: number; unitPrice: number }[];
  shippingAddress?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendOrderConfirmationEmail(to: string, order: OrderEmailData) {
  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2C2C2E;color:#F2F2F7;font-size:13px;">
        ${item.productName}${item.variantTitle ? `<br /><span style="color:#8E8E93;font-size:11px;">${item.variantTitle}</span>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #2C2C2E;color:#8E8E93;font-size:13px;text-align:center;">×${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2C2C2E;color:#FF5500;font-size:13px;font-weight:700;text-align:right;">${formatINR(item.unitPrice * item.quantity)}</td>
    </tr>`
    )
    .join("");

  const addressBlock = order.shippingAddress
    ? `<p style="margin:0;color:#8E8E93;font-size:13px;line-height:1.7;">
        ${order.shippingAddress.fullName}<br />
        ${order.shippingAddress.line1}${order.shippingAddress.line2 ? ", " + order.shippingAddress.line2 : ""}<br />
        ${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pincode}
      </p>`
    : "";

  const body = `
    ${heading("Order confirmed!")}
    <p style="margin:8px 0 0;color:#8E8E93;font-size:15px;">
      Order <strong style="color:#FF5500;">#${order.orderNumber}</strong> has been received and is being processed.
    </p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${itemRows}
      <tr><td colspan="3" style="padding-top:12px;"></td></tr>
      ${infoRow("Subtotal", formatINR(order.subtotal))}
      ${order.discount ? infoRow("Discount", `-${formatINR(order.discount)}`) : ""}
      ${infoRow("Shipping", order.shippingCost === 0 ? "FREE" : formatINR(order.shippingCost))}
      ${infoRow("GST (18%)", formatINR(order.gst))}
      <tr>
        <td style="padding:12px 0 0;color:#F2F2F7;font-size:15px;font-weight:700;">Total</td>
        <td></td>
        <td style="padding:12px 0 0;color:#FF5500;font-size:18px;font-weight:900;text-align:right;">${formatINR(order.total)}</td>
      </tr>
    </table>
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Payment", order.paymentMethod)}
    </table>
    ${
      order.shippingAddress
        ? `${divider()}<p style="margin:0 0 8px;color:#F2F2F7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Ship to</p>${addressBlock}`
        : ""
    }
    ${divider()}
    ${button("Track Order", `https://befitbestrong.com/account/orders`)}
    <p style="margin:16px 0 0;color:#8E8E93;font-size:12px;">
      We'll email you when your order ships.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed — #${order.orderNumber}`,
    html: shell("Order Confirmed", body),
  });
}

// ── Shipping Confirmation Email ─────────────────────────────────────────────

interface ShippingEmailData {
  orderNumber: string;
  trackingNumber?: string | null;
  items: { productName: string; quantity: number }[];
}

export async function sendShippingConfirmationEmail(to: string, order: ShippingEmailData) {
  const itemList = order.items
    .map((item) => `<li style="padding:4px 0;color:#8E8E93;font-size:13px;">${item.productName} ×${item.quantity}</li>`)
    .join("");

  const body = `
    ${heading("Your order is on its way!")}
    <p style="margin:8px 0 0;color:#8E8E93;font-size:15px;">
      Order <strong style="color:#FF5500;">#${order.orderNumber}</strong> has been shipped.
    </p>
    ${divider()}
    ${
      order.trackingNumber
        ? `<table cellpadding="0" cellspacing="0" style="background:#2C2C2E;border-radius:8px;padding:16px;width:100%;box-sizing:border-box;margin-bottom:16px;">
            <tr>
              <td>
                <p style="margin:0;color:#8E8E93;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Tracking Number</p>
                <p style="margin:6px 0 0;color:#FF5500;font-size:18px;font-weight:900;letter-spacing:1px;font-family:monospace;">${order.trackingNumber}</p>
              </td>
            </tr>
          </table>`
        : ""
    }
    <p style="margin:0 0 8px;color:#F2F2F7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Items shipped</p>
    <ul style="margin:0;padding:0 0 0 16px;">
      ${itemList}
    </ul>
    ${divider()}
    ${button("View Order", `https://befitbestrong.com/account/orders`)}
    <p style="margin:16px 0 0;color:#8E8E93;font-size:12px;">
      Estimated delivery: 3–7 business days.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your Order #${order.orderNumber} Has Shipped!`,
    html: shell("Order Shipped", body),
  });
}

// ── Abandoned Cart Email ────────────────────────────────────────────────────

interface CartItem {
  productName: string;
  variantTitle?: string;
  price: number;
  imageUrl?: string;
}

export async function sendAbandonedCartEmail(to: string, name: string, items: CartItem[]) {
  const itemRows = items
    .slice(0, 3)
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2C2C2E;color:#F2F2F7;font-size:13px;">
        ${item.productName}${item.variantTitle ? `<br /><span style="color:#8E8E93;font-size:11px;">${item.variantTitle}</span>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #2C2C2E;color:#FF5500;font-size:13px;font-weight:700;text-align:right;">${formatINR(item.price)}</td>
    </tr>`
    )
    .join("");

  const moreItems = items.length > 3 ? `<p style="margin:8px 0 0;color:#8E8E93;font-size:12px;">…and ${items.length - 3} more item${items.length - 3 > 1 ? "s" : ""}</p>` : "";

  const body = `
    ${heading("You left something behind")}
    <p style="margin:8px 0 0;color:#8E8E93;font-size:15px;line-height:1.7;">
      Hey <strong style="color:#F2F2F7;">${name}</strong>, your cart is waiting for you. Don't let your gains slip away.
    </p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${itemRows}
    </table>
    ${moreItems}
    ${divider()}
    ${button("Complete My Order", "https://befitbestrong.com/cart")}
    <p style="margin:16px 0 0;color:#8E8E93;font-size:12px;">
      Items in your cart are not reserved and may sell out.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${name}, your cart misses you`,
    html: shell("Complete Your Order", body),
  });
}
