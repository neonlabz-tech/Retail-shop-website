'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuthOrRedirect } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { getStorefrontFromPath, getStorefrontOfSlug, productHrefBaseFor, shopHrefFor } from '@/utils/storefront';
import { FALLBACK_IMAGE_SRC, handleImageError, normalizeImageSrc } from '@/lib/imageFallback';

/* ── Icons ── */

function IconClose({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconTrash({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconShoppingBag({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconTruck({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconShield({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconArrowRight({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Cart Drawer ── */

export function CartDrawer() {
  const { items: allItems, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const storefront = getStorefrontFromPath(pathname);
  const items = allItems.filter((i) => getStorefrontOfSlug(i.slug) === storefront);
  const productHrefBase = productHrefBaseFor(storefront);
  const shopHref = shopHrefFor(storefront);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[9998] transition-opacity duration-300 ease-out ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed top-0 right-0 bottom-0 z-[9999] bg-white flex flex-col w-full sm:max-w-[430px] md:max-w-[450px] transition-transform duration-300 ease-out shadow-2xl ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          height: '100dvh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[12px] sm:px-[20px] sm:py-[14px] border-b border-neutral-100 bg-white shrink-0">
          <div className="flex items-center gap-[10px]">
            <span className="w-[24px] h-[24px] rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IconCheck size={12} />
            </span>
            <div>
              <h3 className="text-[1.5rem] font-bold text-neutral-900 tracking-tight leading-tight">
                Item added to your cart
              </h3>
              <p className="text-[1.15rem] text-neutral-500 font-medium">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all -mr-1"
            aria-label="Close cart"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-[16px] sm:px-[20px] py-[4px] divide-y divide-neutral-100 cart-drawer-scroll">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[50px] px-[20px] text-center">
              <div className="w-[60px] h-[60px] rounded-full bg-neutral-100/80 flex items-center justify-center text-neutral-400 mb-[16px]">
                <IconShoppingBag size={30} />
              </div>
              <h4 className="text-[1.7rem] font-bold text-neutral-900 mb-[8px]">Your cart is currently empty</h4>
              <p className="text-[1.35rem] text-neutral-500 mb-[20px] max-w-[260px] leading-relaxed">
                Discover our collections and find something you love.
              </p>
              <Link
                href={shopHref}
                onClick={closeDrawer}
                className="inline-flex items-center justify-center gap-2 px-[24px] py-[10px] bg-neutral-900 hover:bg-neutral-800 text-white text-[1.4rem] font-semibold rounded-lg transition-all shadow-sm active:scale-95"
              >
                <span>Return to shop</span>
                <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const hasColor = Boolean(item.color && item.color.trim() !== '' && item.color.toLowerCase() !== 'default');
              const hasSize = Boolean(item.size && item.size.trim() !== '' && item.size.toLowerCase() !== 'default');

              return (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-[12px] py-[12px] group"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`${productHrefBase}/${item.slug}`}
                    onClick={closeDrawer}
                    className="w-[72px] h-[84px] sm:w-[78px] sm:h-[90px] rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0 relative block transition-transform group-hover:scale-[1.02]"
                  >
                    <Image
                      src={normalizeImageSrc(item.image) || FALLBACK_IMAGE_SRC}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 72px, 78px"
                      onError={handleImageError}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-[1px]">
                    <div>
                      <div className="flex items-start justify-between gap-[8px]">
                        <Link
                          href={`${productHrefBase}/${item.slug}`}
                          onClick={closeDrawer}
                          className="text-[1.35rem] font-semibold text-neutral-900 hover:text-[#F15B41] transition-colors leading-snug line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-[4px] rounded-md transition-colors shrink-0 -mr-1 -mt-1"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>

                      {/* Variant name badge */}
                      {item.variantName ? (
                        <div className="flex items-center gap-[4px] mt-[3px]">
                          <span className="bg-neutral-100 text-neutral-800 text-[1.15rem] font-medium px-[6px] py-[1px] rounded">
                            Variant: {item.variantName}
                          </span>
                        </div>
                      ) : (hasColor || hasSize) ? (
                        <div className="flex flex-wrap items-center gap-[4px] mt-[3px] text-[1.15rem] text-neutral-500">
                          {hasColor && (
                            <span className="bg-neutral-100 text-neutral-700 px-[6px] py-[1px] rounded font-medium">
                              {item.color}
                            </span>
                          )}
                          {hasSize && (
                            <span className="bg-neutral-100 text-neutral-700 px-[6px] py-[1px] rounded font-medium">
                              {item.size}
                            </span>
                          )}
                        </div>
                      ) : null}

                      {/* Price */}
                      <div className="mt-[4px]">
                        <span className="text-[1.45rem] font-bold text-neutral-900">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls + Line Total */}
                    <div className="flex items-center justify-between pt-[6px]">
                      <div className="inline-flex items-center bg-neutral-100 rounded-md p-[2px] border border-neutral-200/70">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-[24px] h-[24px] rounded bg-white shadow-2xs flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all text-[1.4rem] font-light leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-[28px] text-center text-[1.3rem] font-bold text-neutral-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const max = typeof item.stock === 'number' && item.stock > 0 ? item.stock : 99;
                            if (item.quantity >= max) return;
                            updateQuantity(item.productId, item.variantId, item.quantity + 1);
                          }}
                          disabled={typeof item.stock === 'number' && item.stock > 0 ? item.quantity >= item.stock : false}
                          className="w-[24px] h-[24px] rounded bg-white shadow-2xs flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all text-[1.4rem] font-light leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[1.3rem] font-semibold text-neutral-600 tabular-nums whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock && (
                      <p className="text-[1.1rem] text-[#e01117] font-medium pt-[4px]">
                        Max stock reached ({item.stock} available)
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="border-t border-neutral-100 bg-white/95 backdrop-blur-md shrink-0 px-[18px] pt-[12px] sm:px-[20px] sm:pt-[14px] shadow-[0_-6px_20px_rgba(0,0,0,0.04)]"
            style={{
              paddingBottom: 'max(1.4rem, env(safe-area-inset-bottom, 1.4rem))',
            }}
          >
            {/* Subtotal row */}
            <div className="flex items-baseline justify-between mb-[2px]">
              <span className="text-[1.4rem] font-medium text-neutral-600">Subtotal</span>
              <span className="text-[1.9rem] font-extrabold text-neutral-900 tracking-tight tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Shipping Note */}
            <div className="flex items-center gap-[6px] text-[1.15rem] text-neutral-500 mb-[10px]">
              <IconTruck size={13} className="text-neutral-400 shrink-0" />
              <span>Shipping calculated at checkout</span>
            </div>

            {/* Action buttons with reduced height */}
            <div className="grid grid-cols-2 gap-[10px]">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="h-[40px] flex items-center justify-center border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 rounded-lg text-[1.35rem] font-semibold active:scale-[0.98] transition-all text-center"
              >
                View cart
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  closeDrawer();
                  if (!checkAuthOrRedirect(router, '/checkout')) return;
                  router.push('/checkout');
                }}
                className="h-[40px] flex items-center justify-center gap-[6px] bg-[#F15B41] hover:bg-[#d94a32] text-white rounded-lg text-[1.35rem] font-semibold shadow-sm hover:shadow active:scale-[0.98] transition-all text-center cursor-pointer border-none"
              >
                <span>Check out</span>
                <IconArrowRight size={14} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-[10px] pt-[8px] mt-[8px] text-[1.1rem] text-neutral-400 border-t border-neutral-100">
              <span className="flex items-center gap-[4px]">
                <IconShield size={11} className="text-neutral-400" />
                <span>Secure Checkout</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-[4px]">
                <IconTruck size={12} className="text-neutral-400" />
                <span>Fast Delivery</span>
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Clean minimal scrollbar styling */}
      <style jsx global>{`
        .cart-drawer-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .cart-drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .cart-drawer-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 9999px;
        }
        .cart-drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </>
  );
}
