'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatPrice';
import { calculateShippingFee, parseWeightInGrams } from '@/utils/weight';

const ACCENT = '#c96742';
const DARK = '#111111';

const COUNTRIES = [
  { value: '', label: '---' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
];

type PaymentMethod = 'bank' | 'cod';

function IcoCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CheckoutPageContent() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    message?: string;
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      country: string;
      phone: string;
      email: string;
    };
  } | null>(null);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'registered' | 'unregistered' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync authenticated user info when logged in, or reset fields if not logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.firstName) setFirstName(user.firstName);
      else if (user.name) setFirstName(user.name.split(' ')[0] || '');

      if (user.lastName) setLastName(user.lastName);
      else if (user.name) setLastName(user.name.split(' ').slice(1).join(' ') || '');

      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone || '');

      if (Array.isArray(user.addresses) && user.addresses.length > 0) {
        const defaultAddr =
          user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        if (defaultAddr.city) setCity(defaultAddr.city);
        if (defaultAddr.line1) setAddress(defaultAddr.line1);
        if (defaultAddr.country) {
          const matchedCountry = COUNTRIES.find(
            (c) =>
              c.value.toLowerCase() === defaultAddr.country.toLowerCase() ||
              c.label.toLowerCase() === defaultAddr.country.toLowerCase()
          );
          setCountry(matchedCountry ? matchedCountry.value : defaultAddr.country);
        }
      }
    } else if (!isAuthenticated) {
      // Clear all fields when customer is not logged in
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCountry('');
      setCity('');
      setAddress('');
      setNotes('');
      try {
        localStorage.removeItem('customer_checkout_details');
        localStorage.removeItem('customer_user');
      } catch {}
    }
  }, [isAuthenticated, user]);

  const handleEmailBlur = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) return;
    if (isAuthenticated) return;

    try {
      const res = await fetch(`/api/auth/lookup?email=${encodeURIComponent(email.trim())}`);
      if (res.status === 404) {
        setEmailStatus({
          type: 'unregistered',
          message: 'This email is not registered yet. Please create an account to place an order.',
        });
        return;
      }

      const data = await res.json();
      if (data.success && data.exists) {
        setEmailStatus({
          type: 'registered',
          message: 'An account exists with this email. Please log in to complete your order.',
        });
      }
    } catch {
      // Ignore lookup error
    }
  };

  // Track dynamically fetched product weights if missing from cart store
  const [productWeights, setProductWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    const missing = items.filter((i) => typeof i.weight !== 'number');
    if (missing.length === 0) return;

    missing.forEach(async (item) => {
      try {
        const idOrSlug = item.productId || item.slug;
        if (!idOrSlug) return;
        const res = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`);
        if (!res.ok) return;
        const data = await res.json();
        const w = data.product ? parseWeightInGrams(data.product) : 0;
        if (w > 0) {
          setProductWeights((prev) => ({ ...prev, [item.productId || item.slug]: w }));
        }
      } catch {}
    });
  }, [items]);

  const subtotal = getSubtotal();

  // Calculate total order weight in grams
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = typeof item.weight === 'number' && item.weight > 0
      ? item.weight
      : (productWeights[item.productId || item.slug] || 0);
    return sum + itemWeight * (Number(item.quantity) || 1);
  }, 0);

  // Shipping fee is calculated by admin upon dispatch (0 at initial checkout)
  const shippingFee = 0;

  // Tax removed as requested
  const tax = 0;
  const DISCOUNT_RATE = 0.0;
  const discount = Math.round(subtotal * DISCOUNT_RATE);
  const total = Math.max(0, subtotal - discount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (items.length === 0) {
      setOrderError('Your cart is empty. Please add items to your cart.');
      return;
    }
    if (!isAuthenticated) {
      setOrderError('You must have a registered account and be logged in to place an order.');
      return;
    }
    if (!firstName.trim()) {
      setOrderError('Please enter your First Name.');
      return;
    }
    if (!country) {
      setOrderError('Please select your Country/Region.');
      return;
    }
    if (!city.trim()) {
      setOrderError('Please enter your Town/City.');
      return;
    }
    if (!address.trim()) {
      setOrderError('Please enter your Address.');
      return;
    }
    if (!phone.trim()) {
      setOrderError('Please enter your Phone Number.');
      return;
    }
    if (!email.trim()) {
      setOrderError('Please enter your Email.');
      return;
    }
    if (!agreeTerms) {
      setOrderError('Please agree to the website terms and conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          paymentMethod,
          items,
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOrderError(data.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Clean up any temporary checkout storage
      try {
        localStorage.removeItem('customer_checkout_details');
      } catch {}

      const orderSubtotal = typeof data.subtotal === 'number' ? data.subtotal : subtotal;
      const orderDiscount = typeof data.discount === 'number' ? data.discount : discount;
      const orderShippingFee = typeof data.shippingFee === 'number' ? data.shippingFee : shippingFee;
      const orderTax = typeof data.tax === 'number' ? data.tax : tax;
      const orderTotal = typeof data.total === 'number' ? data.total : total;
      const orderPaymentMethod = paymentMethod;
      const orderShippingAddress = {
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      // Clear the cart
      clearCart();

      // Notify header and components that a new order has been placed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-updated'));
        window.dispatchEvent(new CustomEvent('order-placed'));
      }

      setOrderSuccess({
        orderNumber: data.orderNumber,
        message: data.message || 'Your order has been placed successfully!',
        subtotal: orderSubtotal,
        discount: orderDiscount,
        shippingFee: orderShippingFee,
        tax: orderTax,
        total: orderTotal,
        paymentMethod: orderPaymentMethod,
        shippingAddress: orderShippingAddress,
      });
      setIsSubmitting(false);
    } catch {
      setOrderError('A network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="co-hero">
        <h1 className="co-hero-title">Check Out</h1>
      </div>

      {/* ── Main Content ── */}
      {orderSuccess ? (
        <div className="container-main" style={{ paddingTop: '6rem', paddingBottom: '8rem' }}>
          <div className="co-success-card">
            <div className="co-success-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="co-success-title">Thank You For Your Order!</h2>
            <p className="co-success-subtitle">
              Your order has been received and is currently being processed.
            </p>
            <div className="co-success-order-num">
              Order Number: <span>#{orderSuccess.orderNumber}</span>
            </div>
            <div className="co-success-grid">
              <div className="co-success-box">
                <span className="co-success-box-title">Shipping & Billing Address</span>
                <p><strong>{orderSuccess.shippingAddress?.fullName || `${firstName} ${lastName}`.trim()}</strong></p>
                <p>{orderSuccess.shippingAddress?.address || address}</p>
                <p>{orderSuccess.shippingAddress?.city || city}, {orderSuccess.shippingAddress?.country || country}</p>
                <p>Phone: {orderSuccess.shippingAddress?.phone || phone}</p>
                <p>Email: {orderSuccess.shippingAddress?.email || email}</p>
              </div>
              <div className="co-success-box">
                <span className="co-success-box-title">Order Information</span>
                <p>Payment: {orderSuccess.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Direct Bank Transfer'}</p>
                <p>Payment Status: Pending</p>
                <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1px solid #e5e7eb', fontSize: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: '#4b5563' }}>
                    <span>Items Subtotal:</span>
                    <span>{formatPrice(orderSuccess.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: '#4b5563' }}>
                    <span>Discount (0%):</span>
                    <span>{formatPrice(orderSuccess.discount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: '1px dashed #d1d5db', fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
                    <div>
                      <span>Total Amount:</span>
                      <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 400, color: '#6b7280' }}>(Excluding shipping fee)</span>
                    </div>
                    <span style={{ color: '#003b95' }}>{formatPrice(orderSuccess.total)}</span>
                  </div>
                </div>
                <div style={{
                  marginTop: '1.4rem',
                  padding: '1.2rem 1.4rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '0.8rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem',
                  textAlign: 'left',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '1.25rem', color: '#92400e', lineHeight: 1.5 }}>
                    <strong>Notice:</strong> Shipping fee is calculated by admin upon dispatch. When your order is shipped, you will receive an email containing the final total cost (product total + shipping fee).
                  </p>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
              <Link href="/shop" className="co-continue-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-main" style={{ paddingTop: '2.4rem', paddingBottom: '4.8rem' }}>
          {/* ── Registered Customer Requirement / Status Banner ── */}
          {!isAuthenticated ? (
            <div className="mb-[2rem] p-[1.4rem_2rem] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-[1.2rem] shadow-[0_2px_8px_rgba(245,158,11,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-[1.4rem]">
              <div className="flex items-start gap-[1.4rem]">
                <div className="w-[3.6rem] h-[3.6rem] rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                  <svg className="w-[2rem] h-[2rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[1.5rem] font-bold text-gray-900 leading-snug">
                    Customer Account Required to Order
                  </h3>
                  <p className="text-[1.3rem] text-gray-700 mt-[0.2rem]">
                    Only registered customers can order products. Please log in to your account or register to complete checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[1.2rem] shrink-0">
                <Link
                  href="/login?redirect=/checkout"
                  className="inline-flex items-center justify-center px-[1.8rem] py-[0.9rem] rounded-[0.8rem] text-[1.35rem] font-semibold text-white bg-[#111111] hover:bg-[#c96742] transition-colors shadow-sm no-underline"
                >
                  Log In
                </Link>
                <Link
                  href="/register?redirect=/checkout"
                  className="inline-flex items-center justify-center px-[1.8rem] py-[0.9rem] rounded-[0.8rem] text-[1.35rem] font-semibold text-[#111111] bg-white border border-gray-300 hover:border-[#c96742] hover:text-[#c96742] transition-colors shadow-sm no-underline"
                >
                  Register Account
                </Link>
              </div>
            </div>
          ) : user ? (
            <div className="mb-[2rem] p-[1.2rem_1.8rem] bg-emerald-50 border border-emerald-200 rounded-[1.2rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-[1.2rem]">
              <div className="flex items-center gap-[1.2rem]">
                <div className="w-[2.8rem] h-[2.8rem] rounded-full bg-emerald-600 text-white flex items-center justify-center text-[1.4rem] font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-[1.35rem] text-emerald-950 font-medium">
                    Logged in as <strong className="font-bold">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}</strong> ({user.email})
                  </p>
                  <p className="text-[1.2rem] text-emerald-700">Your order will be linked to your registered account.</p>
                </div>
              </div>
              <Link href="/profile" className="text-[1.25rem] text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 shrink-0">
                My Profile
              </Link>
            </div>
          ) : null}

          <div className="co-layout">

            {/* ── LEFT: Billing Details ── */}
            <section className="co-billing-section">
              <h2 className="co-section-title">Billing details</h2>
              <div className="co-fields">

                {/* First + Last name */}
                <div className="co-row-2">
                  <div className="co-field">
                    <label className="co-label">First Name<span className="co-req">*</span></label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder=""
                      className="co-input"
                    />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Last Name<span className="co-req">*</span></label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="co-input"
                    />
                  </div>
                </div>

                {/* Country/Region + Town/City */}
                <div className="co-row-2">
                  <div className="co-field">
                    <label className="co-label">Country/Region<span className="co-req">*</span></label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="co-select"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="co-field">
                    <label className="co-label">Town/City<span className="co-req">*</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="co-input"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="co-field">
                  <label className="co-label">Address<span className="co-req">*</span></label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="co-input"
                  />
                </div>

                {/* Phone Number + Email */}
                <div className="co-row-2">
                  <div className="co-field">
                    <label className="co-label">Phone Number<span className="co-req">*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="co-input"
                    />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Email<span className="co-req">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailStatus.type !== 'idle') {
                          setEmailStatus({ type: 'idle', message: '' });
                        }
                      }}
                      onBlur={handleEmailBlur}
                      className="co-input"
                    />
                  </div>
                </div>

                {!isAuthenticated && emailStatus.type === 'registered' && (
                  <div className="p-[1rem_1.4rem] bg-amber-50 border border-amber-200 rounded-[0.8rem] text-[1.25rem] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.8rem]">
                    <span>An account exists with this email. Please log in to complete your order.</span>
                    <Link href="/login?redirect=/checkout" className="font-semibold underline text-[#111111] hover:text-[#c96742] shrink-0 no-underline">
                      Log In Now →
                    </Link>
                  </div>
                )}
                {!isAuthenticated && emailStatus.type === 'unregistered' && (
                  <div className="p-[1rem_1.4rem] bg-rose-50 border border-rose-200 rounded-[0.8rem] text-[1.25rem] text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-[0.8rem]">
                    <span>This email is not registered. Only registered customers can place orders.</span>
                    <Link href="/register?redirect=/checkout" className="font-semibold underline text-[#c96742] hover:text-[#a84e2c] shrink-0 no-underline">
                      Create Account →
                    </Link>
                  </div>
                )}

                {/* Order notes */}
                <div className="co-field co-field-notes">
                  <label className="co-label">Order notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="co-textarea"
                    rows={2}
                    placeholder="Notes about your order, e.g. special delivery instructions."
                  />
                </div>

              </div>
            </section>

            {/* ── RIGHT: Your Order ── */}
            <aside className="co-order-aside">
              <h2 className="co-section-title">Your order</h2>

              {/* Cart items card */}
              <div className="co-order-card">
                {items.length === 0 ? (
                  <div className="co-empty-state">
                    <p className="co-empty-text">Your shop cart is empty</p>
                    <Link href="/shop" className="co-explore-btn">Explore Products!</Link>
                  </div>
                ) : (
                  <>
                    <div className="co-order-head">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>
                    <div className="co-order-items-list">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.variantId}`} className="co-order-row">
                          <span className="co-order-name">
                            {item.name}{' '}
                            <span className="co-order-qty">× {item.quantity}</span>
                          </span>
                          <span className="co-order-price">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* PAYMENT BREAKDOWN */}
              <div className="co-breakdown-card">
                <div className="co-breakdown-head">
                  <svg className="co-breakdown-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <line x1="7" y1="15" x2="7.01" y2="15" />
                    <line x1="11" y1="15" x2="13" y2="15" />
                  </svg>
                  <span className="co-breakdown-title">PAYMENT BREAKDOWN</span>
                </div>

                <div className="co-breakdown-body">
                  <div className="co-breakdown-row">
                    <span className="co-breakdown-label">Items Subtotal</span>
                    <span className="co-breakdown-val">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="co-breakdown-row">
                    <span className="co-breakdown-label">Discount (0%)</span>
                    <span className="co-breakdown-val">{formatPrice(discount)}</span>
                  </div>
                </div>

                {/* Shipping Fee Notice */}
                <div className="co-shipping-notice">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Shipping fee is calculated by admin upon dispatch. When your order is shipped, you will receive an email containing the final total cost (product total + shipping fee).
                  </span>
                </div>

                <div className="co-breakdown-total">
                  <div className="co-total-left">
                    <span className="co-total-label">Total Amount</span>
                    <span className="co-total-subnote">Excluding shipping fee</span>
                  </div>
                  <div className="co-total-right">
                    <span className="co-total-val">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="co-payment-wrap">
                {(
                  [
                    { value: 'cod' as PaymentMethod, label: 'Cash on delivery' },
                    { value: 'bank' as PaymentMethod, label: 'Direct bank transfer' },
                  ] as const
                ).map(({ value, label }) => (
                  <label
                    key={value}
                    className="co-payment-opt"
                    onClick={() => setPaymentMethod(value)}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    <span className={`co-radio-dot${paymentMethod === value ? ' co-radio-on' : ''}`}>
                      {paymentMethod === value && <IcoCheck />}
                    </span>
                    <span className="co-payment-text">{label}</span>
                  </label>
                ))}
              </div>

              {/* Privacy text */}
              <p className="co-privacy">
                Your personal data will be used to process your order, support your
                experience throughout this website, and for other purposes described in
                our{' '}
                <Link href="/pages/privacy-policy" className="co-link">
                  privacy policy
                </Link>
                .
              </p>

              {/* Terms checkbox */}
              <label className="co-terms">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="co-terms-check"
                />
                <span>
                  I have read and agree to the website{' '}
                  <Link href="#" className="co-link">terms and conditions</Link>
                </span>
              </label>

              {/* Error Alert */}
              {orderError && (
                <div className="co-alert-error" role="alert">
                  <span>{orderError}</span>
                  {!isAuthenticated && (
                    <div className="flex items-center gap-[1rem] mt-[1.2rem]">
                      <Link
                        href="/login?redirect=/checkout"
                        className="inline-flex items-center justify-center px-[1.6rem] py-[0.8rem] bg-[#111111] hover:bg-[#c96742] text-white rounded-[0.6rem] text-[1.3rem] font-semibold transition-colors no-underline"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register?redirect=/checkout"
                        className="inline-flex items-center justify-center px-[1.6rem] py-[0.8rem] bg-white border border-rose-300 hover:border-[#c96742] text-gray-800 rounded-[0.6rem] text-[1.3rem] font-semibold transition-colors no-underline"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Place order button or Registration Requirement */}
              {!isAuthenticated ? (
                <div className="flex flex-col gap-[1rem]">
                  <Link
                    href="/login?redirect=/checkout"
                    className="co-place-order text-center flex items-center justify-center no-underline"
                  >
                    Log In to Place Order
                  </Link>
                  <p className="text-[1.25rem] text-center text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register?redirect=/checkout" className="text-[#c96742] font-semibold underline hover:text-[#a84e2c]">
                      Register here
                    </Link>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  className="co-place-order"
                  disabled={!agreeTerms || isSubmitting}
                  onClick={handlePlaceOrder}
                >
                  {isSubmitting ? 'Placing order...' : 'Place order'}
                </button>
              )}

            </aside>
          </div>
        </div>
      )}

      <style>{coStyles}</style>
    </>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const coStyles = `
  /* ── Hero ── */
  .co-hero {
    background: linear-gradient(135deg, #ffffff 0%, #fdf4f0 50%, #fde8df 100%);
    padding: 2.2rem 0;
    text-align: center;
  }
  .co-hero-title {
    font-size: 2.6rem;
    font-weight: 500;
    color: var(--color-heading);
    letter-spacing: 0.01em;
  }

  /* ── Two-column layout (50/50 Equal Width & Equal Height) ── */
  .co-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3.6rem;
    align-items: stretch;
  }

  /* ── Section titles ── */
  .co-section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 1.4rem;
    line-height: 1.2;
  }

  /* ── Left billing column: flex layout stretching to match right column height ── */
  .co-billing-section {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .co-billing-section .co-fields {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    flex: 1;
  }
  .co-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
  .co-field { display: flex; flex-direction: column; gap: 0.45rem; }
  .co-field-notes {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .co-label {
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--color-heading);
  }
  .co-req { color: #e84d1c; margin-left: 0.15rem; }
  .co-input {
    width: 100%;
    height: 4.2rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 0 1.2rem;
    font-size: 1.35rem;
    color: var(--color-heading);
    background: #fff;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .co-input::placeholder { color: #bbb; }
  .co-input:focus { border-color: #999; }
  .co-select {
    width: 100%;
    height: 4.2rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 0 1.2rem;
    font-size: 1.35rem;
    color: #555;
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .co-select:focus { border-color: #999; }
  .co-textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem 1.2rem;
    font-size: 1.35rem;
    color: var(--color-heading);
    background: #fff;
    outline: none;
    resize: none;
    font-family: inherit;
    line-height: 1.45;
    min-height: 7rem;
    flex: 1;
    height: 100%;
    transition: border-color 0.2s;
  }
  .co-textarea:focus { border-color: #999; }

  /* ── Right aside column: flex layout matching full height ── */
  .co-order-aside {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* ── Order card (cart items) ── */
  .co-order-card {
    background: #f7f7f7;
    border: 1px solid #e5e5e5;
    border-radius: 0.6rem;
    overflow: hidden;
    margin-bottom: 1.2rem;
  }
  .co-empty-state {
    padding: 3rem 2rem;
    text-align: center;
  }
  .co-empty-text {
    font-size: 1.45rem;
    color: #666;
    margin-bottom: 1.6rem;
  }
  .co-explore-btn {
    display: inline-block;
    background: ${DARK};
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 1.1rem 2.8rem;
    border-radius: 0.4rem;
    text-decoration: none;
    text-align: center;
    transition: background 0.2s;
  }
  .co-explore-btn:hover { background: #333; }
  .co-order-head {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 1.6rem;
    background: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #666;
  }
  .co-order-items-list {
    max-height: 14rem;
    overflow-y: auto;
  }
  .co-order-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.8rem 1.6rem;
    border-bottom: 1px solid #f0f0f0;
    gap: 1rem;
  }
  .co-order-row:last-child {
    border-bottom: none;
  }
  .co-order-name {
    font-size: 1.3rem;
    color: var(--color-heading);
    flex: 1;
    line-height: 1.35;
  }
  .co-order-qty { color: #888; font-size: 1.2rem; }
  .co-order-price {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-heading);
    white-space: nowrap;
  }

  /* ── Discount code ── */
  .co-discount-box {
    margin-bottom: 2rem;
  }
  .co-discount-form {
    display: flex;
    gap: 0.8rem;
  }
  .co-discount-input {
    flex: 1;
    height: 4.6rem;
    padding: 0 1.6rem;
    border: 1px solid #d1d5db;
    border-radius: 0.8rem;
    font-size: 1.4rem;
    color: var(--color-heading);
    outline: none;
    font-family: inherit;
    background: #fff;
    transition: border-color 0.2s;
  }
  .co-discount-input:focus {
    border-color: #003b95;
  }
  .co-discount-input::placeholder { color: #9ca3af; }
  .co-discount-apply {
    background: ${DARK};
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0 2rem;
    height: 4.6rem;
    border: none;
    border-radius: 0.8rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s;
  }
  .co-discount-apply:hover { background: #003b95; }
  .co-discount-applied {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.6rem;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 0.8rem;
  }

  /* ── Payment Breakdown Card ── */
  .co-breakdown-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    padding: 1.4rem 1.8rem;
    margin-bottom: 1.4rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }
  .co-breakdown-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  .co-breakdown-icon {
    color: #1e40af;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
  .co-breakdown-title {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #0f2b5c;
  }
  .co-breakdown-body {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border-bottom: 1px solid #f3f4f6;
  }
  .co-breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .co-breakdown-label {
    font-size: 1.35rem;
    color: #4b5563;
    font-weight: 500;
  }
  .co-breakdown-val {
    font-size: 1.4rem;
    color: #111827;
    font-weight: 600;
  }
  .co-val-discount {
    color: #059669 !important;
    font-weight: 700;
  }
  .co-shipping-notice {
    margin: 1.1rem 0;
    padding: 1rem 1.2rem;
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 0.8rem;
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    font-size: 1.2rem;
    color: #92400e;
    line-height: 1.45;
  }
  .co-breakdown-total {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 1.1rem;
  }
  .co-total-left {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .co-total-label {
    font-size: 1.55rem;
    font-weight: 800;
    color: #111827;
  }
  .co-total-subnote {
    font-size: 1.15rem;
    color: #9ca3af;
    font-weight: 500;
  }
  .co-total-right {
    text-align: right;
  }
  .co-total-val {
    font-size: 2rem;
    font-weight: 800;
    color: #003b95;
    letter-spacing: -0.02em;
  }

  /* ── Payment methods ── */
  .co-payment-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-bottom: 1.2rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .co-payment-opt {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    cursor: pointer;
    user-select: none;
  }
  .co-radio-dot {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    border: 2px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    transition: border-color 0.18s, background 0.18s;
  }
  .co-radio-on {
    background: #e84d1c;
    border-color: #e84d1c;
  }
  .co-payment-text {
    font-size: 1.35rem;
    font-weight: 500;
    color: var(--color-heading);
  }

  /* ── Privacy & terms ── */
  .co-privacy {
    font-size: 1.2rem;
    color: #6b7280;
    line-height: 1.45;
    margin-bottom: 1rem;
  }
  .co-link {
    color: ${ACCENT};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .co-terms {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    font-size: 1.25rem;
    color: var(--color-body);
    cursor: pointer;
    margin-bottom: 1.4rem;
    line-height: 1.4;
  }
  .co-terms-check {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
    cursor: pointer;
    accent-color: #e84d1c;
  }

  /* ── Place order button ── */
  .co-place-order {
    width: 100%;
    background: ${DARK};
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    height: 4.8rem;
    border: none;
    border-radius: 0.6rem;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.01em;
    transition: background 0.2s;
  }
  .co-place-order:hover:not(:disabled) { background: #333; }
  .co-place-order:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Alert Error ── */
  .co-alert-error {
    background-color: #fdf2f2;
    border: 1px solid #f8b4b4;
    color: #9b1c1c;
    padding: 1.2rem 1.6rem;
    border-radius: 0.4rem;
    font-size: 1.35rem;
    margin-bottom: 2rem;
    line-height: 1.4;
  }

  /* ── Success Card ── */
  .co-success-card {
    max-width: 68rem;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 0.8rem;
    padding: 5rem 4rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  .co-success-icon-wrap {
    width: 6.8rem;
    height: 6.8rem;
    background: #ecfdf5;
    border: 2px solid #a7f3d0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
  }
  .co-success-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 1rem;
  }
  .co-success-subtitle {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 2.2rem;
  }
  .co-success-order-num {
    display: inline-block;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 0.8rem 2rem;
    border-radius: 2rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-heading);
    margin-bottom: 3rem;
  }
  .co-success-order-num span {
    color: #e84d1c;
    font-family: monospace;
    font-size: 1.6rem;
  }
  .co-success-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    text-align: left;
    margin-top: 1rem;
    border-top: 1px solid #eee;
    padding-top: 2.5rem;
  }
  .co-success-box {
    background: #fafafa;
    border: 1px solid #efefef;
    padding: 2rem;
    border-radius: 0.6rem;
    font-size: 1.35rem;
    color: #444;
    line-height: 1.65;
  }
  .co-success-box-title {
    display: block;
    font-weight: 700;
    font-size: 1.45rem;
    color: var(--color-heading);
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 0.6rem;
  }
  .co-continue-btn {
    display: inline-block;
    background: ${DARK};
    color: #fff !important;
    padding: 1.4rem 3.6rem;
    font-size: 1.5rem;
    font-weight: 600;
    border-radius: 0.4rem;
    text-decoration: none;
    transition: background 0.2s;
  }
  .co-continue-btn:hover {
    background: #333;
  }

  /* ── Responsive ── */
  @media (max-width: 749px) {
    .co-layout { grid-template-columns: 1fr; gap: 4rem; }
    .co-row-2 { grid-template-columns: 1fr; }
    .co-hero-title { font-size: 3rem; }
    .co-success-grid { grid-template-columns: 1fr; }
    .co-success-card { padding: 3rem 2rem; }
    .co-billing-section { height: auto; }
    .co-field-notes { flex: initial; }
    .co-field-notes .co-textarea { height: 7rem; min-height: 7rem; flex: initial; }
    .co-order-aside { height: auto; }
  }
  @media (min-width: 750px) and (max-width: 1023px) {
    .co-layout { grid-template-columns: 1fr 1fr; gap: 3rem; }
  }
`;
