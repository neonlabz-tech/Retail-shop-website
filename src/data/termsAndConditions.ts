/**
 * Single source of truth for RKF Distributors Terms and Conditions & Store Policies.
 * Editing this file automatically updates:
 * 1. Terms & Conditions page (/pages/terms-of-service)
 * 2. Checkout Terms & Conditions modal
 * 3. Product detail Shipping & Return accordions
 * 4. Any other location referencing store policies
 */

export const TERMS_LAST_UPDATED = 'October 27, 2026';

export const TERMS_WELCOME =
  'Welcome to RKF Distributors. By accessing our website or placing an order, you agree to the following Terms and Conditions. Please read them carefully before making a purchase.';

export interface TermsSection {
  id: string;
  number: number;
  title: string;
  intro?: string;
  items?: string[];
  callout?: string;
  footerNote?: string;
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'general-terms',
    number: 1,
    title: 'General Terms',
    items: [
      'RKF Distributors reserves the right to update or modify these Terms and Conditions at any time.',
      'Customers are responsible for providing accurate contact details, delivery addresses, and order information.',
      'Orders are subject to product availability and confirmation by RKF Distributors.',
      'We reserve the right to cancel an order if necessary, including in cases of incorrect product information or stock unavailability.',
    ],
  },
  {
    id: 'orders-and-payments',
    number: 2,
    title: 'Orders and Payments',
    items: [
      'Customers must review their order details carefully before confirming a purchase.',
      'Orders will be processed based on the information provided at checkout.',
      'Customers must complete payment using the payment methods available on our website.',
      'Customers may request order cancellation by contacting RKF Distributors by phone within 24 hours of placing the order. Cancellation requests are subject to order processing status. Once the order has been shipped, cancellation may not be possible.',
    ],
  },
  {
    id: 'shipping-and-delivery',
    number: 3,
    title: 'Shipping and Delivery',
    items: [
      'Orders will be shipped based on the order status and shipping arrangements made by RKF Distributors.',
      'Shipping charges will be added by RKF Distributors when the order status is updated to Shipped.',
      'Customers will receive an email notification when their order status is updated to Shipped.',
      'Customers must provide a complete and accurate delivery address and contact number.',
      'Delivery times may vary depending on the delivery location and other circumstances.',
      'RKF Distributors is not responsible for delays caused by circumstances beyond our reasonable control.',
    ],
  },
  {
    id: 'returns-and-refunds',
    number: 4,
    title: 'Returns and Refunds',
    callout: 'RKF Distributors does not accept returns or provide refunds.',
    items: [
      'Customers are requested to check product details carefully before placing an order.',
      'Please ensure that the selected products, quantities, and order details are correct before completing your purchase.',
      'Once an order is confirmed, customers should contact us as soon as possible if they notice an error in their order details.',
    ],
    footerNote:
      'This policy is subject to any rights or remedies that cannot legally be excluded under applicable Sri Lankan law.',
  },
  {
    id: 'product-info',
    number: 5,
    title: 'Product Information and Availability',
    items: [
      'We make reasonable efforts to ensure that product descriptions, images, prices, and availability information are accurate.',
      'Product images may vary slightly from the actual products.',
      'Product availability and prices may change without prior notice.',
      'If a product becomes unavailable after an order is placed, we will contact the customer regarding the order.',
    ],
  },
  {
    id: 'customer-responsibilities',
    number: 6,
    title: 'Customer Responsibilities',
    intro: 'Customers agree to:',
    items: [
      'Provide accurate and complete information when placing an order.',
      'Use the website for lawful purposes only.',
      'Avoid submitting false orders or misleading information.',
      'Review product information and delivery charges before confirming a purchase.',
    ],
  },
  {
    id: 'customer-information',
    number: 7,
    title: 'Customer Information',
    items: [
      'Customers must provide accurate contact details and delivery information when placing an order.',
      'The information provided will be used to process orders, arrange deliveries, and contact customers regarding their purchases.',
      'Customers are responsible for ensuring that the information submitted during checkout is correct.',
    ],
  },
  {
    id: 'contact-information',
    number: 8,
    title: 'Contact Information',
    intro:
      'If you have any questions about these Terms and Conditions, please contact RKF Distributors using the following details:',
  },
];

export const TERMS_CONTACT_INFO = {
  businessName: 'RKF Distributors',
  address: 'Playground Road, Kopay South, Jaffna, Sri Lanka',
  workingHours: '9:00 AM – 6:00 PM',
};

export const TERMS_THANK_YOU = 'Thank you for choosing RKF Distributors.';

/**
 * Product detail page policies (Shipping & Returns accordion).
 * Displayed under single product detail tabs / accordions.
 */
export const SHIPPING_POLICY_TEXT =
  'Island-wide delivery is available across Sri Lanka. Shipping charges will be added by RKF Distributors when the order status is updated to Shipped. Customers will receive an email notification when their order status is updated to Shipped. Delivery times may vary depending on the delivery location and other circumstances.';

export const RETURN_POLICY_TEXT =
  'RKF Distributors does not accept returns or offer refunds. Customers are advised to check product details and order information carefully before placing an order.';
