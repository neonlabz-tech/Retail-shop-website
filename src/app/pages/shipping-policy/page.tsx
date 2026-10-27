'use client';

import Link from 'next/link';
import { SHIPPING_POLICY_TEXT } from '@/data/termsAndConditions';

export default function ShippingPolicyPage() {
  return (
    <>
      <div className="fa-sp-page-header">
        <div className="container-main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px' }}>
            <Link href="/" style={{ color: '#777', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Home</Link>
            <span style={{ color: '#bbb' }}>/</span>
            <span style={{ color: '#222' }}>Shipping policy</span>
          </div>
          <h1 className="fa-sp-h1">Shipping policy</h1>
        </div>
      </div>

      <div className="container-main fa-sp-content-wrap">
        <div className="fa-sp-prose">
          <p style={para}>Thank you for visiting and shopping with RKF Distributors. The following terms and conditions constitute our Shipping Policy.</p>

          <h2 className="fa-sp-h2">Shipment Processing Time</h2>
          <p style={para}>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or public holidays.</p>
          <p style={para}>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.</p>

          <h2 className="fa-sp-h2">Shipping Rates &amp; Delivery Estimates</h2>
          <p style={para}>{SHIPPING_POLICY_TEXT}</p>

          <h2 className="fa-sp-h2">Shipment Confirmation &amp; Order Notification</h2>
          <p style={para}>Customers will receive an email notification when their order status is updated to Shipped, including tracking details and any applicable shipping charges.</p>

          <h2 className="fa-sp-h2">Terms and Conditions</h2>
          <p style={{ marginBottom: '0' }}>
            For more details regarding our store policies, cancellations, and order details, please refer to our full{' '}
            <Link href="/pages/terms-of-service" style={{ color: '#c96742', textDecoration: 'underline' }}>
              Terms and Conditions
            </Link>
            .
          </p>
        </div>
      </div>

      <style>{`
        .fa-sp-page-header { background-color: rgb(247, 248, 252); padding: 40px 0 50px; text-align: center; }
        .fa-sp-h1 { font-size: 40px; font-weight: 600; color: #222; }
        .fa-sp-content-wrap { padding-block: 60px 100px; }
        .fa-sp-prose { max-width: 680px; margin: 0 auto; font-size: 15px; color: #555; line-height: 1.8; }
        .fa-sp-h2 { font-size: 22px; font-weight: 700; color: #222; margin-bottom: 14px; margin-top: 40px; }
        @media (max-width: 749px) {
          .fa-sp-page-header { padding: clamp(28px, 6vw, 40px) 0 clamp(30px, 7vw, 50px); }
          .fa-sp-h1 { font-size: clamp(26px, 6.5vw, 40px); }
          .fa-sp-content-wrap { padding-block: clamp(36px, 7vw, 60px) clamp(60px, 12vw, 100px); }
          .fa-sp-prose { font-size: clamp(13px, 3.8vw, 15px); }
          .fa-sp-h2 { font-size: clamp(17px, 4.5vw, 22px); margin-top: clamp(28px, 6vw, 40px); }
        }
      `}</style>
    </>
  );
}

const para: React.CSSProperties = { marginBottom: '20px' };
