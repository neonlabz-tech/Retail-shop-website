import { Resend } from 'resend';
import { STORE_EMAIL, STORE_PHONE, STORE_ADDRESS, SITE_NAME } from '@/lib/constants';
import { formatPrice } from '@/utils/formatPrice';

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'info@rkfdistributors.lk';
export const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'RKF Distributors';
export const DEFAULT_FROM = `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`;

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Dispatches an email via Resend with graceful error handling.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM,
  replyTo = RESEND_FROM_EMAIL,
}: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Resend] RESEND_API_KEY is not configured. Email dispatch skipped.');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    const validRecipients = recipients
      .map((e) => (typeof e === 'string' ? e.trim() : ''))
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (validRecipients.length === 0) {
      return { success: false, error: 'No valid recipient email provided' };
    }

    const response = await client.emails.send({
      from,
      to: validRecipients,
      replyTo,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim(),
    });

    if (response.error) {
      console.error('[Resend Error]', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err?.message || 'Unknown email sending failure' };
  }
}

/* ──────────────────────────────────────────────────────────────
   HTML Email Templates
   ────────────────────────────────────────────────────────────── */

function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  total: number;
  subtotal: number;
  discount?: number;
  shippingFee?: number;
  paymentMethod?: string;
  customerSnapshot?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  items: OrderConfirmationItem[];
  createdAt?: string | Date;
  notes?: string;
}

export const emailTemplates = {
  /**
   * Order Confirmation Email Template - Status: Processing
   */
  orderConfirmation(order: OrderConfirmationData): string {
    const orderNum = escapeHtml(order.orderNumber.replace(/^#/, ''));
    const customerName = escapeHtml(
      order.customerSnapshot?.name || order.shippingAddress?.fullName || 'Valued Customer'
    );
    const dateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

    const paymentLabel =
      order.paymentMethod === 'cod'
        ? 'Cash on Delivery'
        : order.paymentMethod === 'bank_transfer'
        ? 'Bank Transfer'
        : escapeHtml(order.paymentMethod || 'Standard Payment');

    const itemsHtml = (order.items || [])
      .map((item) => {
        const itemTotal = formatPrice(item.price * item.quantity);
        const metaParts: string[] = [];
        if (item.color) metaParts.push(`Color: ${escapeHtml(item.color)}`);
        if (item.size && item.size !== 'default') metaParts.push(`Size: ${escapeHtml(item.size)}`);
        const metaText = metaParts.length > 0 ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${metaParts.join(' | ')}</div>` : '';

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: left; vertical-align: top;">
              <strong style="color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(item.name)}</strong>
              ${metaText}
              <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; vertical-align: top; color: #111827; font-weight: 600; font-size: 14px;">
              ${itemTotal}
            </td>
          </tr>
        `;
      })
      .join('');

    const discountRow = (order.discount || 0) > 0
      ? `
        <tr>
          <td style="padding: 6px 0; color: #059669; font-size: 13px;">Discount</td>
          <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600; font-size: 13px;">-${formatPrice(order.discount || 0)}</td>
        </tr>
      `
      : '';

    const shippingFeeRow =
      typeof order.shippingFee === 'number' && order.shippingFee > 0
        ? `
          <tr>
            <td style="padding: 6px 0; color: #4b5563; font-size: 13px;">Delivery Fee</td>
            <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 500; font-size: 13px;">
              ${formatPrice(order.shippingFee)}
            </td>
          </tr>
        `
        : `
          <tr>
            <td style="padding: 6px 0; color: #4b5563; font-size: 13px;">Delivery Fee</td>
            <td style="padding: 6px 0; text-align: right; color: #d97706; font-weight: 600; font-size: 13px;">
              Calculated by Admin upon dispatch
            </td>
          </tr>
        `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed #${orderNum}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Official Store</p>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: #fffbeb; color: #d97706; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                ⚙️ Status: Processing
              </div>
              <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Order Received &amp; Processing</h2>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                Hello <strong>${customerName}</strong>, thank you for shopping with us! We have received your order and our fulfillment team is currently processing it for delivery.
              </p>
            </td>
          </tr>

          <!-- Order Summary Bar -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 13px; color: #64748b;">Order Number: <strong style="color: #0f172a;">#${orderNum}</strong></td>
                  <td style="font-size: 13px; color: #64748b; text-align: right;">Date: <strong style="color: #0f172a;">${dateFormatted}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 24px 32px 12px 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Purchased Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                <tr>
                  <td style="padding: 6px 0; color: #4b5563; font-size: 13px;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 500; font-size: 13px;">${formatPrice(order.subtotal)}</td>
                </tr>
                ${discountRow}
                ${shippingFeeRow}
                <tr>
                  <td style="padding: 12px 0 0 0; color: #0f172a; font-size: 16px; font-weight: 700; border-top: 2px solid #0f172a;">
                    Total ${(!order.shippingFee || order.shippingFee === 0) ? '<span style="font-size: 11px; font-weight: normal; color: #64748b;">(Excl. delivery fee)</span>' : ''}
                  </td>
                  <td style="padding: 12px 0 0 0; text-align: right; color: #c96742; font-size: 18px; font-weight: 700; border-top: 2px solid #0f172a;">${formatPrice(order.total)}</td>
                </tr>
              </table>
              ${(!order.shippingFee || order.shippingFee === 0) ? `
                <div style="margin-top: 14px; padding: 12px 14px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.45;">
                  <strong>ℹ️ Shipping Fee Note:</strong> Shipping fee is calculated by our team upon dispatch. When your order is shipped, you will receive an email containing the final total cost (product total + shipping fee).
                </div>
              ` : ''}
            </td>
          </tr>

          <!-- Delivery & Payment Info -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase;">Delivery Address</h4>
                    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4;">
                      ${escapeHtml(order.shippingAddress?.fullName || customerName)}<br>
                      ${escapeHtml(order.shippingAddress?.line1 || '')}<br>
                      ${escapeHtml(order.shippingAddress?.city || '')}${order.shippingAddress?.country ? `, ${escapeHtml(order.shippingAddress.country)}` : ''}<br>
                      ${escapeHtml(order.shippingAddress?.phone || order.customerSnapshot?.phone || '')}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase;">Payment Details</h4>
                    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4;">
                      Method: <strong>${paymentLabel}</strong><br>
                      Email: ${escapeHtml(order.customerSnapshot?.email || '')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support & Footer -->
          <tr>
            <td style="padding: 28px 32px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #ffffff;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">
                Have a question or need assistance with your order?
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #0f172a;">
                Contact us anytime at <a href="mailto:${STORE_EMAIL}" style="color: #c96742; font-weight: 600; text-decoration: none;">${STORE_EMAIL}</a> or call <strong>${STORE_PHONE}</strong>
              </p>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                ${escapeHtml(STORE_ADDRESS)} &bull; ${escapeHtml(STORE_EMAIL)}
                <br>&copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME || 'RKF Distributors')}. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },

  /**
   * Order Status Update Email Template (Shipped, Delivered, Processing, etc.)
   */
  orderStatusUpdate(
    orderNumber: string,
    status: string,
    customerName?: string,
    note?: string,
    reviewItems?: { name: string; reviewUrl: string; image?: string }[],
    pricing?: {
      subtotal?: number;
      shippingFee?: number;
      discount?: number;
      total?: number;
      paymentMethod?: string;
      items?: any[];
      shippingAddress?: any;
      customerSnapshot?: any;
    }
  ): string {
    const cleanNum = escapeHtml(orderNumber.replace(/^#/, ''));
    const safeCustomer = escapeHtml(customerName || 'Customer');
    const safeStatus = status.toLowerCase().trim();

    let statusTitle = `Order #${cleanNum} Status: ${status.toUpperCase()}`;
    let statusMessage = `Your order #${cleanNum} is now ${status.replace(/_/g, ' ')}.`;
    let badgeColor = '#0f172a';
    let badgeBg = '#f1f5f9';
    let icon = '📦';

    switch (safeStatus) {
      case 'confirmed':
        statusTitle = 'Order Confirmed ✅';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, your order <strong>#${cleanNum}</strong> has been confirmed and registered in our system.`;
        badgeColor = '#059669';
        badgeBg = '#ecfdf5';
        icon = '✅';
        break;
      case 'processing':
        statusTitle = 'Order In Processing ⚙️';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, thank you for shopping with us! We have received your order <strong>#${cleanNum}</strong> and it is currently being prepared for dispatch.`;
        badgeColor = '#d97706';
        badgeBg = '#fffbeb';
        icon = '⚙️';
        break;
      case 'shipped':
        statusTitle = 'Your Order is on the Way! 🚚';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, great news! Your order <strong>#${cleanNum}</strong> has been shipped and is on its way to you.`;
        badgeColor = '#2563eb';
        badgeBg = '#eff6ff';
        icon = '🚚';
        break;
      case 'out_for_delivery':
        statusTitle = 'Out for Delivery Today 🛵';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, your package for order <strong>#${cleanNum}</strong> is out for delivery with our courier.`;
        badgeColor = '#7c3aed';
        badgeBg = '#f5f3ff';
        icon = '🛵';
        break;
      case 'delivered':
        statusTitle = 'Your Order Has Been Delivered! 📦';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, your package for order <strong>#${cleanNum}</strong> has been successfully delivered! We hope you love your purchase.`;
        badgeColor = '#059669';
        badgeBg = '#ecfdf5';
        icon = '📦';
        break;
      case 'cancelled':
        statusTitle = 'Order Cancelled ❌';
        statusMessage = `Hello <strong>${safeCustomer}</strong>, your order <strong>#${cleanNum}</strong> has been cancelled. Please contact our support team if you have any questions.`;
        badgeColor = '#dc2626';
        badgeBg = '#fef2f2';
        icon = '❌';
        break;
    }

    const noteBlock = note
      ? `
        <tr>
          <td style="padding: 16px 32px 0 32px;">
            <div style="padding: 12px 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; font-size: 13px; color: #15803d; text-align: left;">
              <strong>Courier / Tracking Note:</strong> ${escapeHtml(note)}
            </div>
          </td>
        </tr>
      `
      : '';

    // Items table HTML (placed mail style)
    let itemsTableHtml = '';
    if (pricing && Array.isArray(pricing.items) && pricing.items.length > 0) {
      const rows = pricing.items
        .map((item: any) => {
          const itemTotal = formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1));
          const metaParts: string[] = [];
          if (item.color) metaParts.push(`Color: ${escapeHtml(item.color)}`);
          if (item.size && item.size !== 'default') metaParts.push(`Size: ${escapeHtml(item.size)}`);
          const metaText = metaParts.length > 0 ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${metaParts.join(' | ')}</div>` : '';

          return `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: left; vertical-align: top;">
                <strong style="color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(item.name || 'Product')}</strong>
                ${metaText}
                <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">Qty: ${item.quantity || 1} × ${formatPrice(Number(item.price) || 0)}</div>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; vertical-align: top; color: #111827; font-weight: 600; font-size: 14px;">
                ${itemTotal}
              </td>
            </tr>
          `;
        })
        .join('');

      itemsTableHtml = `
        <!-- Items Table -->
        <tr>
          <td style="padding: 24px 32px 12px 32px;">
            <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Purchased Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td>
        </tr>
      `;
    }

    // Pricing / Cost breakdown block (placed mail style)
    let pricingBreakdownHtml = '';
    if (pricing && (safeStatus === 'shipped' || safeStatus === 'delivered')) {
      const subtotal = Number(pricing.subtotal) || 0;
      const discount = Number(pricing.discount) || 0;
      const shippingFee = Number(pricing.shippingFee) || 0;
      const grandTotal = typeof pricing.total === 'number'
        ? Number(pricing.total)
        : Math.max(0, subtotal - discount + shippingFee);

      const discountRow = discount > 0
        ? `
          <tr>
            <td style="padding: 6px 0; color: #059669; font-size: 13px;">Discount</td>
            <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600; font-size: 13px;">-${formatPrice(discount)}</td>
          </tr>
        `
        : '';

      pricingBreakdownHtml = `
        <!-- Pricing Breakdown -->
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
              <tr>
                <td style="padding: 6px 0; color: #4b5563; font-size: 13px;">Product Total</td>
                <td style="padding: 6px 0; text-align: right; color: #111827; font-weight: 500; font-size: 13px;">${formatPrice(subtotal)}</td>
              </tr>
              ${discountRow}
              <tr>
                <td style="padding: 6px 0; color: #2563eb; font-size: 13px; font-weight: 600;">Shipping Fee</td>
                <td style="padding: 6px 0; text-align: right; color: #2563eb; font-weight: 700; font-size: 13px;">
                  ${formatPrice(shippingFee)}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; color: #0f172a; font-size: 15px; font-weight: 700; border-top: 2px solid #0f172a;">
                  Total Fee (Product Total + Shipping Fee)
                </td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #c96742; font-size: 18px; font-weight: 800; border-top: 2px solid #0f172a;">
                  ${formatPrice(grandTotal)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    // Review section for delivered orders
    let reviewBlock = '';
    if (safeStatus === 'delivered') {
      const siteOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://rkfdistributors.lk';
      const fallbackItem = pricing?.items?.[0];
      const fallbackProductKey =
        fallbackItem?.slug ||
        fallbackItem?.product?.slug ||
        fallbackItem?.productId ||
        fallbackItem?.product?._id?.toString?.() ||
        fallbackItem?.name;
      const fallbackReviewUrl = fallbackProductKey
        ? `${siteOrigin}/products/${encodeURIComponent(String(fallbackProductKey))}?writeReview=true&orderNumber=${encodeURIComponent(orderNumber)}#reviews`
        : null;
      const itemsListHtml = (reviewItems && reviewItems.length > 0)
        ? reviewItems.map((item) => {
            const rawUrl = item.reviewUrl || '';
            const fullUrl = rawUrl.startsWith('http')
              ? rawUrl
              : `${siteOrigin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            return `
              <div style="margin-bottom: 10px; background-color: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 16px; text-align: left;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <strong style="color: #0f172a; font-size: 13px;">${escapeHtml(item.name)}</strong>
                    </td>
                    <td style="vertical-align: middle; text-align: right; white-space: nowrap; padding-left: 12px;">
                      <a href="${escapeHtml(fullUrl)}" target="_blank" style="display: inline-block; background-color: #c96742; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 8px 18px; border-radius: 6px;">
                        Write Review &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            `;
          }).join('')
        : `
          <div style="margin-top: 14px;">
            ${fallbackReviewUrl
              ? `<a href="${escapeHtml(fallbackReviewUrl)}" target="_blank" style="display: inline-block; background-color: #c96742; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 3px 6px rgba(201, 103, 66, 0.2);">Leave a Review &rarr;</a>`
              : '<span style="color: #4b5563; font-size: 13px;">Visit the product page to leave your review.</span>'}
          </div>
        `;

      reviewBlock = `
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <div style="padding: 24px 20px; background-color: #fff9f6; border: 1px solid #fed7aa; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; line-height: 1; margin-bottom: 8px;">⭐⭐⭐⭐⭐</div>
              <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Rate &amp; Review Your Items</h3>
              <p style="margin: 0 0 18px 0; color: #4b5563; font-size: 13px; line-height: 1.5; max-width: 440px; margin-left: auto; margin-right: auto;">
                We hope you love your purchase! Click below to review your items and share your experience with other shoppers.
              </p>
              ${itemsListHtml}
            </div>
          </td>
        </tr>
      `;
    }

    // Delivery & Payment Details (if provided)
    let deliveryPaymentHtml = '';
    const shippingAddress = pricing?.shippingAddress;
    const customerSnapshot = pricing?.customerSnapshot;
    const paymentMethod = pricing?.paymentMethod;
    const hasAddress = Boolean(shippingAddress?.fullName || shippingAddress?.line1 || customerSnapshot?.name);
    const paymentLabel =
      paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : paymentMethod === 'bank_transfer'
        ? 'Direct Bank Transfer'
        : paymentMethod ? escapeHtml(paymentMethod) : 'Standard Payment';

    if (hasAddress || paymentMethod || customerSnapshot?.email) {
      deliveryPaymentHtml = `
        <tr>
          <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="vertical-align: top; padding-right: 16px;">
                  <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase;">Delivery Address</h4>
                  <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4;">
                    ${escapeHtml(shippingAddress?.fullName || customerSnapshot?.name || safeCustomer)}<br>
                    ${shippingAddress?.line1 ? `${escapeHtml(shippingAddress.line1)}<br>` : ''}
                    ${shippingAddress?.city ? `${escapeHtml(shippingAddress.city)}${shippingAddress.country ? `, ${escapeHtml(shippingAddress.country)}` : ''}<br>` : ''}
                    ${escapeHtml(shippingAddress?.phone || customerSnapshot?.phone || '')}
                  </p>
                </td>
                <td width="50%" style="vertical-align: top; padding-left: 16px;">
                  <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase;">Payment Details</h4>
                  <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4;">
                    Method: <strong>${paymentLabel}</strong><br>
                    ${customerSnapshot?.email ? `Email: ${escapeHtml(customerSnapshot.email)}` : ''}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle} #${cleanNum}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Official Store</p>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                ${icon} Status: ${escapeHtml(status.replace(/_/g, ' '))}
              </div>
              <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 22px; font-weight: 700;">${statusTitle}</h2>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                ${statusMessage}
              </p>
            </td>
          </tr>

          <!-- Order Summary Bar -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 13px; color: #64748b;">Order Number: <strong style="color: #0f172a;">#${cleanNum}</strong></td>
                  <td style="font-size: 13px; color: #64748b; text-align: right;">Status: <strong style="color: #0f172a; text-transform: capitalize;">${escapeHtml(status)}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          ${noteBlock}

          ${itemsTableHtml}

          ${pricingBreakdownHtml}

          ${reviewBlock}

          ${deliveryPaymentHtml}

          <!-- Support & Footer -->
          <tr>
            <td style="padding: 28px 32px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #ffffff;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">
                Have a question or need assistance with your order?
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #0f172a;">
                Contact us anytime at <a href="mailto:${STORE_EMAIL}" style="color: #c96742; font-weight: 600; text-decoration: none;">${STORE_EMAIL}</a> or call <strong>${STORE_PHONE}</strong>
              </p>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                ${escapeHtml(STORE_ADDRESS)} &bull; ${escapeHtml(STORE_EMAIL)}
                <br>&copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME || 'RKF Distributors')}. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },

  /**
   * Account Activation Email Template
   */
  accountActivation(name: string, activationUrl: string): string {
    const safeName = escapeHtml(name || 'Customer');
    const safeUrl = escapeHtml(activationUrl);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Official Store</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #fdf4f0; color: #c96742; font-size: 28px; margin-bottom: 16px;">
                ✉️
              </div>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Activate Your Account</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6; max-width: 460px; margin-left: auto; margin-right: auto;">
                Hello <strong>${safeName}</strong>, thank you for registering with ${escapeHtml(SITE_NAME || 'RKF Distributors')}! To verify your email address and activate your account, please click the button below:
              </p>

              <!-- CTA Button -->
              <div style="margin: 28px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background-color: #c96742; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.3px; box-shadow: 0 3px 6px rgba(201, 103, 66, 0.25);">
                  Activate My Account
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                This activation link is valid for <strong>24 hours</strong>. If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; word-break: break-all;">
                <a href="${safeUrl}" style="color: #c96742; text-decoration: underline;">${safeUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Didn't create an account with us? You can safely ignore this email.
              </p>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 12px;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME || 'RKF Distributors')}. All rights reserved. &bull; ${escapeHtml(STORE_EMAIL)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },

  /**
   * Password Reset Email Template
   */
  passwordReset(name: string, resetUrl: string): string {
    const safeName = escapeHtml(name || 'Customer');
    const safeUrl = escapeHtml(resetUrl);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Official Store</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #fee2e2; color: #dc2626; font-size: 26px; margin-bottom: 16px;">
                🔒
              </div>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Password Reset Request</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6; max-width: 460px; margin-left: auto; margin-right: auto;">
                Hello <strong>${safeName}</strong>, we received a request to reset the password for your ${escapeHtml(SITE_NAME || 'RKF Distributors')} account. Click the button below to choose a new password:
              </p>

              <!-- CTA Button -->
              <div style="margin: 28px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.3px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);">
                  Reset My Password
                </a>
              </div>

              <div style="margin: 24px 0 0 0; padding: 14px 18px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; text-align: left;">
                <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                  <strong>Note:</strong> This link is secure and will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains completely secure.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; word-break: break-all;">
                <a href="${safeUrl}" style="color: #c96742; text-decoration: underline;">${safeUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Need help? Contact us anytime at <a href="mailto:${STORE_EMAIL}" style="color: #c96742; font-weight: 600; text-decoration: none;">${STORE_EMAIL}</a>
              </p>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 12px;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME || 'RKF Distributors')}. All rights reserved. &bull; ${escapeHtml(STORE_EMAIL)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },

  /**
   * Welcome Email Template for verified registrations
   */
  welcome(name: string, email: string): string {
    const safeName = escapeHtml(name || 'Customer');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to RKF Distributors</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px;">Welcome, ${safeName}! 🎉</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                Thank you for creating an account with <strong>${escapeHtml(SITE_NAME || 'RKF Distributors')}</strong>. We're excited to have you on board!
              </p>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                With your account (${escapeHtml(email)}), you can:
              </p>
              <ul style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                <li>Track your orders and view order history in real-time</li>
                <li>Receive automatic delivery notifications and updates</li>
                <li>Enjoy fast, seamless checkouts</li>
                <li>Save your favorite products to your wishlist</li>
              </ul>
              <div style="margin-top: 24px; text-align: center;">
                <a href="https://rkfdistributors.lk" style="display: inline-block; background-color: #c96742; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px;">Start Shopping</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME || 'RKF Distributors')}. All rights reserved. &bull; ${escapeHtml(STORE_EMAIL)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },

  /**
   * Contact Form Submission Notification Template
   */
  contactNotification(data: { name: string; email: string; phone?: string; subject?: string; comment?: string }): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #111827; line-height: 1.5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
    <h2 style="color: #0f172a; margin-top: 0;">New Contact Form Message</h2>
    <p><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</p>
    ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
    <p><strong>Subject:</strong> ${escapeHtml(data.subject || 'Website Inquiry')}</p>
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.comment || '')}</p>
    </div>
    <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-bottom: 0;">
      Received via website contact form on ${new Date().toLocaleString('en-GB')}.
    </p>
  </div>
</body>
</html>
    `;
  },

  /**
   * Admin Notification Email Template for New Orders
   */
  adminNewOrderNotification(order: OrderConfirmationData): string {
    const orderNum = escapeHtml(order.orderNumber.replace(/^#/, ''));
    const customerName = escapeHtml(
      order.customerSnapshot?.name || order.shippingAddress?.fullName || 'Valued Customer'
    );
    const customerEmail = escapeHtml(order.customerSnapshot?.email || '');
    const customerPhone = escapeHtml(
      order.customerSnapshot?.phone || order.shippingAddress?.phone || ''
    );
    const dateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('en-GB');

    const paymentLabel =
      order.paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : order.paymentMethod === 'bank_transfer'
        ? 'Bank Transfer'
        : escapeHtml(order.paymentMethod || 'Standard Payment');

    const itemsHtml = (order.items || [])
      .map((item) => {
        const itemTotal = formatPrice(item.price * item.quantity);
        const metaParts: string[] = [];
        if (item.color) metaParts.push(`Color: ${escapeHtml(item.color)}`);
        if (item.size && item.size !== 'default') metaParts.push(`Size: ${escapeHtml(item.size)}`);
        const metaText = metaParts.length > 0 ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${metaParts.join(' | ')}</div>` : '';

        return `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: left; vertical-align: top;">
              <strong style="color: #111827; font-size: 13px;">${escapeHtml(item.name)}</strong>
              ${metaText}
              <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">Qty: ${item.quantity} &times; ${formatPrice(item.price)}</div>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right; vertical-align: top; color: #111827; font-weight: 600; font-size: 13px;">
              ${itemTotal}
            </td>
          </tr>
        `;
      })
      .join('');

    const discountRow = (order.discount || 0) > 0
      ? `
        <tr>
          <td style="padding: 4px 0; color: #059669; font-size: 13px;">Discount</td>
          <td style="padding: 4px 0; text-align: right; color: #059669; font-weight: 600; font-size: 13px;">-${formatPrice(order.discount || 0)}</td>
        </tr>
      `
      : '';

    const shippingFeeRow =
      typeof order.shippingFee === 'number'
        ? `
          <tr>
            <td style="padding: 4px 0; color: #4b5563; font-size: 13px;">Delivery Fee</td>
            <td style="padding: 4px 0; text-align: right; color: #111827; font-weight: 500; font-size: 13px;">
              ${order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
            </td>
          </tr>
        `
        : '';

    const notesBlock = order.notes
      ? `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; text-align: left;">
          <strong style="color: #92400e; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">Customer Note:</strong>
          <span style="font-size: 13px; color: #78350f;">${escapeHtml(order.notes)}</span>
        </div>
      `
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${orderNum}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #cbd5e1;">
          
          <!-- Admin Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f172a; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(SITE_NAME || 'RKF DISTRIBUTORS')}</h1>
                    <span style="display: inline-block; background-color: #c96742; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Store Admin Alert</span>
                  </td>
                  <td style="text-align: right; color: #94a3b8; font-size: 13px;">
                    Order: <strong style="color: #ffffff;">#${orderNum}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #ecfdf5; color: #059669; font-size: 13px; font-weight: 700; margin-bottom: 12px;">
                🔔 NEW CUSTOMER ORDER
              </div>
              <h2 style="margin: 0 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Order #${orderNum} Placed (${formatPrice(order.total)})
              </h2>
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                Placed on ${dateFormatted} &bull; Payment: <strong>${paymentLabel}</strong>
              </p>
            </td>
          </tr>

          <!-- Customer & Delivery Summary -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 16px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Contact</h3>
                    <p style="margin: 0; font-size: 13px; color: #0f172a; line-height: 1.5;">
                      <strong>${customerName}</strong><br>
                      ${customerEmail ? `<a href="mailto:${customerEmail}" style="color: #c96742; text-decoration: none;">${customerEmail}</a><br>` : ''}
                      ${customerPhone ? `<a href="tel:${customerPhone}" style="color: #0f172a; text-decoration: none;">${customerPhone}</a>` : ''}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h3>
                    <p style="margin: 0; font-size: 13px; color: #0f172a; line-height: 1.5;">
                      ${escapeHtml(order.shippingAddress?.fullName || customerName)}<br>
                      ${escapeHtml(order.shippingAddress?.line1 || '')}<br>
                      ${escapeHtml(order.shippingAddress?.city || '')}${order.shippingAddress?.country ? `, ${escapeHtml(order.shippingAddress.country)}` : ''}
                    </p>
                  </td>
                </tr>
              </table>
              ${notesBlock}
            </td>
          </tr>

          <!-- Ordered Items Table -->
          <tr>
            <td style="padding: 24px 32px 12px 32px;">
              <h3 style="margin: 0 0 14px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Items Ordered</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Total Breakdown -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 500; font-size: 13px;">${formatPrice(order.subtotal)}</td>
                </tr>
                ${discountRow}
                ${shippingFeeRow}
                <tr>
                  <td style="padding: 10px 0 0 0; color: #0f172a; font-size: 15px; font-weight: 700; border-top: 2px solid #0f172a;">Total Amount</td>
                  <td style="padding: 10px 0 0 0; text-align: right; color: #c96742; font-size: 17px; font-weight: 700; border-top: 2px solid #0f172a;">${formatPrice(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Admin Quick Action Buttons -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <div style="display: inline-block;">
                ${customerPhone ? `
                  <a href="tel:${customerPhone}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin: 4px 6px;">
                    📞 Call Customer
                  </a>
                ` : ''}
                ${customerEmail ? `
                  <a href="mailto:${customerEmail}" style="display: inline-block; background-color: #c96742; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin: 4px 6px;">
                    ✉️ Email Customer
                  </a>
                ` : ''}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #ffffff; font-size: 11px; color: #94a3b8;">
              This is an automated notification from ${escapeHtml(SITE_NAME || 'RKF Distributors')} ecommerce store.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  },
};
