'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

/* ── Icons ── */

function IconHome({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M6 19H18V9.15745L12 3.7029L6 9.15745V19ZM19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM7.5 13H9.5C9.5 14.3807 10.6193 15.5 12 15.5C13.3807 15.5 14.5 14.3807 14.5 13H16.5C16.5 15.4853 14.4853 17.5 12 17.5C9.51472 17.5 7.5 15.4853 7.5 13Z" />
    </svg>
  );
}

function IconCategory({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
    >
      <circle cx="15" cy="9.5" r="5" />
      <line x1="18.6" y1="13.1" x2="21.5" y2="16" />
      <line x1="2.5" y1="7" x2="8" y2="7" />
      <line x1="2.5" y1="12" x2="7" y2="12" />
      <line x1="2.5" y1="17" x2="11" y2="17" />
    </svg>
  );
}

function IconShop({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconCart({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}

function IconAccount({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
    </svg>
  );
}

/* ── Component ── */

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const accent = '#c96742';
  const homeHref = '/';
  const categoriesHref = '/categories';
  const productsHref = '/products';
  const accountHref = '/profile';

  const openCart = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const isHomeActive = pathname === '/';
  const isCategoryActive = pathname.includes('/categories') || pathname.includes('/collections');
  const isProductsActive = pathname === '/products' || pathname.startsWith('/products/') || pathname === '/shop';
  const isAccountActive = pathname === accountHref;

  return (
    <nav className="mbn-bar" aria-label="Primary mobile navigation">
      <div className="container-main mbn-inner">
        {/* 1. Category */}
        <Link
          href={categoriesHref}
          className={`mbn-item ${isCategoryActive ? 'is-active' : ''}`}
          aria-label="Category"
        >
          <IconCategory />
          <span className="mbn-label">Category</span>
        </Link>

        {/* 2. Products */}
        <Link
          href={productsHref}
          className={`mbn-item ${isProductsActive ? 'is-active' : ''}`}
          aria-label="Products"
        >
          <IconShop />
          <span className="mbn-label">Products</span>
        </Link>

        {/* 3. Home (Center Floating Button) */}
        <Link
          href={homeHref}
          className={`mbn-center-item ${isHomeActive ? 'is-active' : ''}`}
          aria-label="Home"
        >
          <span className="mbn-center-circle">
            <IconHome size={24} />
          </span>
        </Link>

        {/* 4. Cart */}
        <button
          type="button"
          className="mbn-item"
          onClick={openCart}
          aria-label="Open cart"
        >
          <span className="mbn-icon-wrap">
            <IconCart />
            {cartCount > 0 && <span className="mbn-badge">{cartCount}</span>}
          </span>
          <span className="mbn-label">Cart</span>
        </button>

        {/* 5. Account */}
        <Link
          href={accountHref}
          className={`mbn-item ${isAccountActive ? 'is-active' : ''}`}
          aria-label="Account"
        >
          <IconAccount />
          <span className="mbn-label">Account</span>
        </Link>
      </div>

      <style jsx>{`
        .mbn-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0 auto;
          width: 100%;
          max-width: var(--container-max);
          height: 66px;
          display: none;
          background: #ffffff;
          border-top: 1px solid #e4e6ea;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
          z-index: 150;
          overflow: visible;
        }

        :global(.mbn-bar .mbn-inner) {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          padding-left: 2px !important;
          padding-right: 2px !important;
          max-width: 100%;
          box-sizing: border-box;
        }

        :global(.mbn-bar .mbn-item) {
          flex: 1 1 0%;
          width: 20%;
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          color: #64748b;
          padding: 0 1px;
          box-sizing: border-box;
          transition: color 180ms ease, transform 180ms ease;
        }

        :global(.mbn-bar .mbn-item:active) {
          transform: translateY(1px);
        }

        :global(.mbn-bar .mbn-item.is-active) {
          color: ${accent};
        }

        :global(.mbn-bar .mbn-label) {
          font-size: 11px;
          font-weight: 500;
          color: inherit;
          line-height: 1.1;
          display: block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.mbn-bar .mbn-icon-wrap) {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        :global(.mbn-bar .mbn-badge) {
          position: absolute;
          top: -4px;
          right: -8px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 9999px;
          background-color: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          line-height: 16px;
          text-align: center;
          box-sizing: border-box;
        }

        /* ── Center Floating Button ── */
        :global(.mbn-bar .mbn-center-item) {
          flex: 0 0 54px;
          width: 54px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          text-decoration: none;
        }

        :global(.mbn-bar .mbn-center-circle) {
          position: absolute;
          top: -14px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #111111;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
          transition: transform 180ms ease, background-color 180ms ease;
        }

        :global(.mbn-bar .mbn-center-item.is-active .mbn-center-circle) {
          background: ${accent};
        }

        :global(.mbn-bar .mbn-center-item:active .mbn-center-circle) {
          transform: scale(0.95);
        }

        @media (max-width: 715px) {
          .mbn-bar {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}
