'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getStorefrontFromPath, getStorefrontOfSlug } from '@/utils/storefront';

/* Active Wear header — two-row layout matching the screenshot:
   Row 1 → search (left) · logo (center) · account/wishlist/cart (right)
   Row 2 → primary nav (left) · "Need help? Call Us" (right)
   Announcement bar is the dark (#111) fashion bar (social · welcome · currency).
   DesktopNav / MobileNav are the shared, storefront-aware components, so the
   nav data, drawers and counts scope to Active Wear automatically. */

const ACCENT = '#F15B41';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}
function IconUser({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" />
    </svg>
  );
}
function IconHeart({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z" />
    </svg>
  );
}
function IconShoppingBag({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}
function IconSearch({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        position: 'absolute',
        top: '-6px',
        right: '-8px',
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        borderRadius: '50%',
        backgroundColor: ACCENT,
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  );
}

const iconBtnStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#222',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  transition: 'color 150ms ease',
};
function hoverIn(e: React.MouseEvent<HTMLElement>) { e.currentTarget.style.color = ACCENT; }
function hoverOut(e: React.MouseEvent<HTMLElement>) { e.currentTarget.style.color = '#222'; }

/* Right cluster — account · wishlist · cart (no search icon; search is the left bar) */
function ActiveWearActions() {
  const { openSearch } = useUIStore();
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const storefront = getStorefrontFromPath(usePathname());
  const cartCount = cartItems
    .filter((i) => getStorefrontOfSlug(i.slug) === storefront)
    .reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.filter((i) => getStorefrontOfSlug(i.slug) === storefront).length;

  return (
    <>
      {/* Desktop cluster */}
      <div className="aw-desktop-actions">
        <Link href="/login" style={{ ...iconBtnStyle, textDecoration: 'none' }} aria-label="Account" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <IconUser />
        </Link>
        <Link href="/wishlist" style={{ ...iconBtnStyle, textDecoration: 'none' }} aria-label="Wishlist" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <IconHeart />
          <CountBadge count={wishlistCount} />
        </Link>
        <button onClick={openCartDrawer} style={iconBtnStyle} aria-label="Open cart" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <IconShoppingBag />
          <CountBadge count={cartCount} />
        </button>
      </div>

      {/* Mobile cluster — search + cart */}
      <div className="aw-mobile-icons">
        <button onClick={openSearch} style={iconBtnStyle} aria-label="Search" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <IconSearch size={24} />
        </button>
        <button onClick={openCartDrawer} style={iconBtnStyle} aria-label="Open cart" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <IconShoppingBag size={24} />
          <CountBadge count={cartCount} />
        </button>
      </div>
    </>
  );
}

export function ActiveWearHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <AnnouncementBar backgroundColor="#111" />

      <header
        className="aw-main-header"
        style={{
          zIndex: 200,
          backgroundColor: '#fff',
          overflow: 'visible',
        }}
      >
        {/* Row 1: Search | Logo | Actions */}
        <div className="aw-header-top">
          <div className="container-main aw-top-inner">
            <div className="aw-col-left">
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="aw-mobile-menu-btn"
                style={{ display: 'none', alignItems: 'center', justifyContent: 'center', color: '#222', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                <IconMenu />
              </button>
              <div className="aw-search-wrap">
                <SearchBar />
              </div>
            </div>

            <div className="aw-col-center">
              <Logo href="/home/active-wear-shop" src="/active-wear/logo/logo1.webp" />
            </div>

            <div className="aw-col-right">
              <ActiveWearActions />
            </div>
          </div>
        </div>

        {/* Row 2: Nav + Call Us (desktop only) */}
        <div className="aw-header-nav">
          <div className="container-main aw-nav-flex">
            <DesktopNav />
            <a href="tel:+842500888333" className="aw-callus">
              <span className="aw-callus-label">Need help? Call Us:</span>
              <span className="aw-callus-number">+84 2500 888 33</span>
            </a>
          </div>
        </div>
      </header>

      <MobileNav />

      <style jsx global>{`
        /* Partial sticky: the whole header is sticky but offset upward by Row 1's
           height (90px inner + 1px border = 91px), so Row 1 (search/logo/actions)
           and the announcement bar above scroll away, leaving only Row 2 (nav +
           Call Us) pinned flush at the top of the viewport. */
        .aw-main-header {
          position: -webkit-sticky;
          position: sticky;
          top: -91px;
          z-index: 200;
          border-bottom: 1px solid #ececec;
          will-change: transform;
        }

        /* ── Row 1 ── */
        .aw-header-top { border-bottom: 1px solid #f0f0f0; }
        .aw-top-inner {
          height: 90px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
        }
        .aw-col-left { display: flex; align-items: center; gap: 12px; }
        .aw-search-wrap { flex: 1; max-width: 420px; }
        .aw-col-center { display: flex; align-items: center; justify-content: center; }
        .aw-col-right { display: flex; align-items: center; justify-content: flex-end; }
        .aw-desktop-actions { display: flex; align-items: center; gap: 22px; }
        .aw-mobile-icons { display: none; align-items: center; gap: 18px; }

        /* ── Row 2 ── */
        .aw-header-nav { border-top: 1px solid #f0f0f0; }
        .aw-nav-flex {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Call Us ── */
        .aw-callus {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .aw-callus-label { color: #555; font-weight: 400; }
        .aw-callus-number { font-weight: 700; color: #111; position: relative; }
        .aw-callus-number::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1.5px;
          background-color: #111;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 300ms ease;
        }
        .aw-callus:hover .aw-callus-number::after { transform: scaleX(1); }

        /* ── Mobile ≤ 991px ── */
        @media (max-width: 991px) {
          /* Row 2 is hidden on mobile, so pin the single 64px row normally. */
          .aw-main-header { top: 0; }
          .aw-top-inner {
            height: 64px;
            grid-template-columns: auto 1fr auto;
            gap: 0;
          }
          .aw-mobile-menu-btn { display: flex !important; }
          .aw-search-wrap { display: none !important; }
          .aw-col-center { justify-content: center; }
          .aw-desktop-actions { display: none !important; }
          .aw-mobile-icons { display: flex !important; }
          .aw-header-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
