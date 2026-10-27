'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkAuthOrRedirect } from '@/store/authStore';
import { useState, type ReactNode } from 'react';
import { useCartStore } from '@/store/cartStore';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { FeaturedSlider } from '@/features/home/components/FeaturedSlider';
import { formatPrice } from '@/utils/formatPrice';
import { FREE_SHIPPING_THRESHOLD, GIFT_WRAP_PRICE } from '@/lib/constants';

const ACCENT = '#c96742';

const SHIP_COUNTRIES = [
  { value: 'LK', label: 'Sri Lanka' },
];

function IcoTruck({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1" y="3" width="14" height="12" rx="1" />
      <path d="M15 8h4l3 3.5V18h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}

function IcoReturn({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.13" />
    </svg>
  );
}

function IcoShield({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IcoGift({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IcoPercent() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IcoDoc() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IcoLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IcoKeyboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}

function IcoClose() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IcoChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      className={`shrink-0 transition-transform duration-300 ease-in-out ${open ? 'rotate-0' : 'rotate-180'}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function TrustBadges() {
  const badges = [
    { Icon: IcoTruck, title: 'Islandwide Delivery', desc: 'Fast delivery across Sri Lanka' },
    { Icon: IcoReturn, title: 'Easy Returns', desc: '7-day return policy' },
    { Icon: IcoShield, title: 'Secure Ordering', desc: 'Cash on Delivery & Bank Transfer' },
  ];
  return (
    <div className="cp-trust">
      {badges.map(({ Icon, title, desc }) => (
        <div key={title} className="cp-trust-card">
          <Icon />
          <p className="cp-trust-title">{title}</p>
          <p className="cp-trust-desc">{desc}</p>
        </div>
      ))}
    </div>
  );
}

function GiftOptions({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="cp-gift-box">
      <h3 className="cp-gift-heading">
        <IcoGift /> Gift Options
      </h3>
      <label className="cp-gift-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="cp-gift-check"
        />
        <span>
          For <strong>{formatPrice(GIFT_WRAP_PRICE)}</strong> per item, please wrap the products in this order.
        </span>
      </label>
    </div>
  );
}

function AccordionSection({
  icon, title, children, defaultOpen = true,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cp-accord">
      <button className="cp-accord-head" onClick={() => setOpen(!open)}>
        <span className="cp-accord-icon">{icon}</span>
        <span className="cp-accord-title">{title}</span>
        <IcoChevron open={open} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="cp-accord-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function CartPageContent() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    couponCode,
    discount,
  } = useCartStore();

  const [giftWrap, setGiftWrap] = useState(false);

  const subtotal = getSubtotal();
  const giftTotal = giftWrap ? items.reduce((s, i) => s + i.quantity, 0) * GIFT_WRAP_PRICE : 0;
  const discountAmount = Math.min(subtotal, discount || 0);
  const total = Math.max(0, subtotal - discountAmount + giftTotal);

  if (items.length === 0) {
    return (
      <>
        <div className="container-main pt-[20px] pb-[80px]">
          <h1 className="cp-page-title">Your Shopping Cart</h1>

          <div className="cp-empty-center">
            <Link href="/products" className="cp-return-btn">Return to shop</Link>
            <div className="cp-account-block">
              <h2 className="cp-account-heading">Have an account?</h2>
              <p className="cp-account-text">
                <Link href="/login" className="cp-login-link">Log in</Link>{' '}to check out faster.
              </p>
            </div>
          </div>

          <GiftOptions checked={false} onChange={() => {}} />
        </div>

        <div className="pb-[80px]">
          <FeaturedSlider title="You may also like" />
        </div>
        <style>{cpStyles}</style>
      </>
    );
  }

  return (
    <>
      <div className="container-main pt-[20px] pb-[80px]">
        <h1 className="cp-page-title">Your Shopping Cart</h1>

        <div className="cp-layout">

          <div className="cp-left">

            <div className="cp-cart-box">
              <div className="cp-cart-head">
                <span className="cp-cart-label">Your cart</span>
                <span className="cp-cart-count">{items.length} product{items.length !== 1 ? 's' : ''}</span>
              </div>

              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="cp-item relative">
                  <Link href={`/products/${item.slug}`} className="cp-item-img">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="100px"
                      className="object-contain"
                    />
                  </Link>
                  <div className="cp-item-body">
                    {item.vendor && <span className="cp-item-vendor">{item.vendor}</span>}
                    <p className="cp-item-name">{item.name}</p>
                    {item.color && <p className="cp-item-attr">Color:{item.color}</p>}
                    {item.size && item.size !== 'default' && (
                      <p className="cp-item-attr">Size:{item.size}</p>
                    )}
                    <div className="cp-item-foot">
                      <div>
                        <QuantitySelector
                          value={item.quantity}
                          max={typeof item.stock === 'number' && item.stock > 0 ? item.stock : 99}
                          onChange={(qty) => updateQuantity(item.productId, item.variantId, qty)}
                        />
                        {typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock && (
                          <p className="text-[12px] text-[#e01117] font-medium mt-[4px]">
                            Max stock reached ({item.stock} available)
                          </p>
                        )}
                      </div>
                      <span className="cp-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="cp-item-x absolute top-[18px] right-[20px]"
                    aria-label="Remove item"
                  >
                    <IcoClose />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cp-right">
            <div className="cp-summary">
              <h3 className="cp-summary-title">Order Summary</h3>

              <div className="cp-totals">
                <div className="cp-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="cp-total-row text-[#059669]">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {giftWrap && (
                  <div className="cp-total-row">
                    <span>Gift wrapping</span>
                    <span>{formatPrice(giftTotal)}</span>
                  </div>
                )}
                <div className="cp-total-row cp-total-bold">
                  <span>Total</span>
                  <span className="text-[#F15B41] font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              <p className="cp-tax-note">Taxes and delivery fee calculated at checkout</p>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (!checkAuthOrRedirect(router, '/checkout')) return;
                  router.push('/checkout');
                }}
                className="cp-checkout-btn w-full inline-flex items-center justify-center gap-[8px] no-underline cursor-pointer border-none"
              >
                <IcoLock /> Secure Checkout
              </button>
            </div>

          </div>
        </div>
      </div>

      <FeaturedSlider title="You may also like" />
      <style>{cpStyles}</style>
    </>
  );
}

const cpStyles = `
  /* page title */
  .cp-page-title {
    font-size: 2.6rem;
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.2;
    margin-bottom: 2rem;
  }

  /* ── empty state ── */
  .cp-empty-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4rem 0 3.6rem;
  }
  .cp-return-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${ACCENT};
    color: #fff;
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.3rem 3.6rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: opacity 0.2s;
    margin-bottom: 3.6rem;
  }
  .cp-return-btn:hover { opacity: 0.85; }
  .cp-account-block { text-align: center; }
  .cp-account-heading {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 0.5rem;
  }
  .cp-account-text { font-size: 1.5rem; color: var(--color-body); }
  .cp-login-link { color: var(--color-heading); text-decoration: underline; }

  /* ── trust badges ── */
  .cp-trust {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.4rem;
    margin: 0;
  }
  .cp-trust-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 1px solid #e8e8e8;
    border-radius: 0.8rem;
    padding: 2.4rem 1.8rem;
    color: #666;
  }
  .cp-trust-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-top: 1.2rem;
    margin-bottom: 0.5rem;
  }
  .cp-trust-desc {
    font-size: 1.35rem;
    color: ${ACCENT};
  }

  /* ── gift options ── */
  .cp-gift-box {
    border: 1px solid #e8e8e8;
    border-radius: 0.8rem;
    padding: 2rem 2.4rem;
  }
  .cp-gift-heading {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    font-size: 1.65rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 1.4rem;
  }
  .cp-gift-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.5rem;
    color: var(--color-body);
    cursor: pointer;
  }
  .cp-gift-check {
    width: 1.7rem;
    height: 1.7rem;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: ${ACCENT};
  }

  /* ── two-column layout ── */
  .cp-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 30%;
    gap: 2.4rem;
    align-items: start;
  }
  /* 80px gap between left-column sections */
  .cp-left { display: flex; flex-direction: column; gap: 2.4rem; }

  /* right sidebar: bordered card + sticky */
  .cp-right {
    position: sticky;
    top: 2rem;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    border: 1px solid #e5e5e5;
    border-radius: 1rem;
    background: #fff;
    scrollbar-width: none;
  }
  .cp-right::-webkit-scrollbar { display: none; }

  /* ── your cart box ── */
  .cp-cart-box {
    border: 1px solid #e8e8e8;
    border-radius: 0.8rem;
    overflow: hidden;
  }
  .cp-cart-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.8rem 2.4rem;
    border-bottom: 1px solid #e8e8e8;
  }
  .cp-cart-label {
    font-size: 1.65rem;
    font-weight: 700;
    color: var(--color-heading);
  }
  .cp-cart-count {
    font-size: 1.45rem;
    color: #888;
  }

  /* ── cart item row ── */
  .cp-item {
    display: flex;
    gap: 1.8rem;
    padding: 2.2rem 2.4rem 2.2rem 2rem;
    border-bottom: 1px solid #e8e8e8;
  }
  .cp-item:last-child { border-bottom: none; }
  .cp-item-img {
    position: relative;
    width: 10rem;
    height: 11rem;
    flex-shrink: 0;
    background: #f5f5f5;
    border-radius: 0.6rem;
    overflow: hidden;
    display: block;
  }
  .cp-item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding-right: 3.4rem;
  }
  .cp-item-vendor {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${ACCENT};
    margin-bottom: 0.35rem;
  }
  .cp-item-x {
    width: 2.6rem;
    height: 2.6rem;
    flex-shrink: 0;
    border: 1px solid #d0d0d0;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #888;
    transition: background 0.18s, border-color 0.18s, color 0.18s;
  }
  .cp-item-x:hover { background: #f5f5f5; border-color: #999; color: #333; }
  .cp-item-name {
    font-size: 1.65rem;
    font-weight: 600;
    color: var(--color-heading);
    line-height: 1.4;
    margin-bottom: 0.35rem;
  }
  .cp-item-attr {
    font-size: 1.45rem;
    color: ${ACCENT};
    line-height: 1.6;
  }
  .cp-item-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 1.4rem;
  }
  .cp-item-price {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-heading);
  }

  /* ── accordion sections (inside bordered cp-right card) ── */
  .cp-accord {
    border-bottom: 1px solid #e5e5e5;
  }
  .cp-accord:last-of-type {
    border-bottom: none;
  }
  .cp-accord-head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1.7rem 2rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }
  .cp-accord-head:hover { background: #fafafa; }
  .cp-accord-icon {
    display: flex;
    align-items: center;
    color: #666;
    flex-shrink: 0;
  }
  .cp-accord-title {
    flex: 1;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-heading);
  }
  .cp-accord-body {
    padding: 0 2rem 2rem;
  }

  /* ── promo code ── */
  .cp-promo-row { display: flex; gap: 0.9rem; align-items: center; }
  .cp-promo-input {
    flex: 1;
    height: 4.4rem;
    border: 1px solid #e0e0e0;
    border-radius: 9999px;
    padding: 0 1.6rem;
    font-size: 1.45rem;
    color: var(--color-heading);
    outline: none;
    font-family: inherit;
    background: #fff;
    min-width: 0;
  }
  .cp-promo-input::placeholder { color: #aaa; }
  .cp-promo-input:focus { border-color: #bbb; }
  .cp-apply-btn {
    background: ${ACCENT};
    color: #fff;
    font-size: 1.45rem;
    font-weight: 600;
    padding: 0 2.2rem;
    height: 4.4rem;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.2s;
    font-family: inherit;
  }
  .cp-apply-btn:hover { opacity: 0.85; }

  /* ── estimate shipping ── */
  .cp-ship-fields { display: flex; flex-direction: column; gap: 0.9rem; }
  .cp-field-label {
    font-size: 1.35rem;
    font-weight: 500;
    color: var(--color-heading);
    margin-bottom: 0.1rem;
  }
  .cp-select {
    width: 100%;
    height: 4.2rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.6rem;
    padding: 0 1.2rem;
    font-size: 1.45rem;
    color: #555;
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }
  .cp-select:focus { border-color: #bbb; }
  .cp-input-wrap { position: relative; }
  .cp-text-input {
    width: 100%;
    height: 4.2rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.6rem;
    padding: 0 3.8rem 0 1.2rem;
    font-size: 1.45rem;
    color: var(--color-heading);
    outline: none;
    background: #fff;
    font-family: inherit;
  }
  .cp-text-input::placeholder { color: #aaa; }
  .cp-text-input:focus { border-color: #bbb; }
  .cp-input-icon {
    position: absolute;
    right: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    display: flex;
    pointer-events: none;
  }
  .cp-calc-btn {
    width: 100%;
    background: ${ACCENT};
    color: #fff;
    font-size: 1.55rem;
    font-weight: 600;
    height: 4.6rem;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
    margin-top: 0.6rem;
  }
  .cp-calc-btn:hover { opacity: 0.85; }

  /* ── order instructions ── */
  .cp-notes-wrap { display: flex; flex-direction: column; gap: 0.7rem; }
  .cp-notes-area {
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 0.6rem;
    padding: 1.1rem 1.3rem;
    font-size: 1.45rem;
    color: var(--color-heading);
    outline: none;
    resize: vertical;
    font-family: inherit;
    line-height: 1.5;
    background: #fff;
    min-height: 9rem;
  }
  .cp-notes-area:focus { border-color: #bbb; }
  .cp-char-count { font-size: 1.25rem; color: #aaa; text-align: right; }

  /* ── order summary (bottom of right card) ── */
  .cp-summary {
    padding: 2.2rem 2rem;
  }
  .cp-summary-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 1.4rem;
  }
  .cp-ship-msg {
    font-size: 1.45rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.4rem;
  }
  .cp-progress-track {
    position: relative;
    width: 100%;
    height: 0.5rem;
    background: #e8e8e8;
    border-radius: 9999px;
    overflow: visible;
    margin-bottom: 2.8rem;
    margin-top: 0.4rem;
  }
  .cp-progress-fill {
    height: 100%;
    background: #e87070;
    border-radius: 9999px;
    transition: width 0.5s ease;
  }
  .cp-progress-thumb {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 2.8rem;
    height: 2.8rem;
    background: #fff;
    border: 2px solid #e87070;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e87070;
    transition: left 0.5s ease;
    z-index: 1;
  }
  .cp-totals {
    border-top: 1px solid #e8e8e8;
    padding-top: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .cp-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    color: #666;
    padding: 0.55rem 0;
  }
  .cp-total-row span:last-child { color: var(--color-heading); }
  .cp-total-bold {
    border-top: 1px solid #e8e8e8;
    margin-top: 0.6rem;
    padding-top: 1rem;
    font-size: 1.65rem;
    font-weight: 700;
  }
  .cp-total-bold span { color: var(--color-heading) !important; font-weight: 700; }
  .cp-tax-note {
    font-size: 1.3rem;
    color: #aaa;
    margin: 1.1rem 0 1.8rem;
    line-height: 1.4;
  }
  .cp-checkout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    width: 100%;
    background: #111;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 600;
    height: 5.4rem;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
    letter-spacing: 0.01em;
  }
  .cp-checkout-btn:hover { background: #2d2d2d; }

  /* ── responsive ── */
  @media (max-width: 749px) {
    .cp-page-title {
      font-size: 2.2rem;
      margin-bottom: 1.6rem;
    }
    .cp-layout { grid-template-columns: 1fr; }
    .cp-trust { grid-template-columns: 1fr; }
    .cp-left { gap: 2rem; }
    .cp-item-foot {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
    }
    .cp-item-price {
      white-space: nowrap;
    }
    .cp-right {
      position: static;
      max-height: none;
      overflow-y: visible;
    }
  }
  @media (min-width: 750px) and (max-width: 1023px) {
    .cp-layout { grid-template-columns: minmax(0, 1fr) 28rem; }
  }
`;
