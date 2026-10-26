'use client';

import { GroceryAnnouncementBar } from './GroceryAnnouncementBar';
import { Logo } from './Logo';
import { GroceryDesktopNav } from './GroceryDesktopNav';
import { GroceryHeaderActions } from './GroceryHeaderActions';
import { SearchBar } from './SearchBar';
import { AllCategoriesButton } from './AllCategoriesButton';
import { MobileNav } from './MobileNav';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { isGrocerySlug } from '@/utils/storefront';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={28} height={28}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={26} height={26}>
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

function IconShoppingBag() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={26} height={26}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}

function IconHeadphones({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M22 17.0022C21.999 19.8731 19.9816 22.2726 17.2872 22.8616L16.6492 20.9476C17.8532 20.7511 18.8765 20.0171 19.4649 19H17C15.8954 19 15 18.1046 15 17V13C15 11.8954 15.8954 11 17 11H19.9381C19.446 7.05369 16.0796 4 12 4C7.92038 4 4.55399 7.05369 4.06189 11H7C8.10457 11 9 11.8954 9 13V17C9 18.1046 8.10457 19 7 19H4C2.89543 19 2 18.1046 2 17V12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V12.9987V13V17V17.0013V17.0022ZM20 17V13H17V17H20ZM4 13V17H7V13H4Z" />
    </svg>
  );
}

function GroceryMobileIcons() {
  const { openSearch } = useUIStore();
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems
    .filter((i) => isGrocerySlug(i.slug))
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="gh-mobile-icons">
      <button
        onClick={openSearch}
        aria-label="Search"
        className="gh-mobile-icon-btn"
      >
        <IconSearch />
      </button>
      <button
        onClick={openCartDrawer}
        aria-label="Open cart"
        className="gh-mobile-icon-btn gh-mobile-cart-btn"
      >
        <IconShoppingBag />
        {cartCount > 0 && <span className="gh-mobile-badge">{cartCount}</span>}
      </button>
    </div>
  );
}

export function GroceryHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <GroceryAnnouncementBar />

      <header
        className="grocery-main-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#fff',
          overflow: 'visible',
        }}
      >
        {/* Row 1: Logo | Search | Actions */}
        <div className="grocery-header-top">
          <div className="container-main gh-top-inner">

            {/* LEFT — desktop: hamburger(hidden)+logo  |  mobile: hamburger only */}
            <div className="gh-col-left">
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="grocery-mobile-menu-btn"
              >
                <IconMenu />
              </button>
              <span className="gh-desktop-logo">
                <Logo href="/home/grocery-shop" />
              </span>
            </div>

            {/* CENTER — desktop: search bar  |  mobile: logo */}
            <div className="gh-col-center">
              <div className="grocery-search-wrap">
                <SearchBar />
              </div>
              <span className="gh-mobile-logo">
                <Logo href="/home/grocery-shop" />
              </span>
            </div>

            {/* RIGHT — desktop: full actions  |  mobile: search+cart icons */}
            <div className="gh-col-right">
              <span className="gh-desktop-actions">
                <GroceryHeaderActions />
              </span>
              <GroceryMobileIcons />
            </div>

          </div>
        </div>

        {/* Row 2: Categories | Nav | Call Us  (desktop only) */}
        <div className="grocery-header-nav">
          <div
            className="container-main grocery-nav-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '20% 60% 20%',
              alignItems: 'center',
              height: '75px',
            }}
          >
            <div style={{ justifySelf: 'start', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
              <AllCategoriesButton />
            </div>

            <div className="grocery-desktop-nav-wrapper" style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <GroceryDesktopNav />
            </div>

            <a href="tel:+842500888333" className="grocery-callus" style={{ justifySelf: 'end' }}>
              <span className="grocery-callus-icon"><IconHeadphones size={22} /></span>
              <span className="grocery-callus-label">Call Us:</span>
              <span className="grocery-callus-number">+84 2500 888 33</span>
            </a>
          </div>
        </div>
      </header>

      <MobileNav />

      <style jsx global>{`
        .grocery-main-header {
          background-color: #fff;
        }

        @media (min-width: 992px) {
          .grocery-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }

        .grocery-header-top {
          background-color: #fff;
          border-bottom: 1px solid #eee;
        }

        /* ── Desktop top row ── */
        .gh-top-inner {
          height: 82px;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
        }

        .gh-col-left {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-self: start;
        }

        .gh-col-center {
          width: 100%;
        }

        .gh-col-right {
          justify-self: end;
        }

        /* Desktop: hide mobile-only elements */
        .grocery-mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          color: #222;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: color 180ms ease;
        }
        .grocery-mobile-menu-btn:hover { color: #1B8057; }

        .gh-mobile-logo  { display: none; }
        .gh-mobile-icons { display: none; }

        /* ── Nav row ── */
        .grocery-header-nav {
          background-color: #fff;
          border-bottom: 1px solid #eee;
        }

        /* ── Call Us link ── */
        .grocery-callus {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #222;
          font-size: 17px;
          font-weight: 500;
          transition: color 200ms ease;
        }
        .grocery-callus-icon {
          color: #222;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 250ms ease;
        }
        .grocery-callus:hover .grocery-callus-icon {
          transform: rotate(-10deg) scale(1.05);
        }
        .grocery-callus-label { color: #222; font-weight: 500; }
        .grocery-callus-number {
          font-weight: 700;
          color: #222;
          position: relative;
        }
        .grocery-callus-number::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1.5px;
          background-color: #222;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 300ms ease;
        }
        .grocery-callus:hover .grocery-callus-number::after {
          transform: scaleX(1);
        }

        /* ── Mobile icons (right side) ── */
        .gh-mobile-icons {
          align-items: center;
          gap: 18px;
        }
        .gh-mobile-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          color: #222;
          cursor: pointer;
          transition: color 180ms ease;
        }
        .gh-mobile-icon-btn:hover { color: #1B8057; }

        .gh-mobile-cart-btn { position: relative; }
        .gh-mobile-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9999px;
          background-color: #e11d48;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          border: 2px solid #fff;
        }

        /* ─────────────────────────────────────────
           Mobile header  ≤ 991px
        ───────────────────────────────────────── */
        @media (max-width: 991px) {
          /* Switch to 3-col: hamburger | logo | icons */
          .gh-top-inner {
            grid-template-columns: auto 1fr auto;
            height: 64px;
            gap: 0;
          }

          /* LEFT: show hamburger */
          .grocery-mobile-menu-btn { display: flex !important; }
          .gh-desktop-logo          { display: none; }

          /* CENTER: centered logo */
          .gh-col-center {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .grocery-search-wrap { display: none !important; }
          .gh-mobile-logo {
            display: inline-flex;
            transform: scale(1.1);
            transform-origin: center;
          }

          /* RIGHT: search + cart icons */
          .gh-desktop-actions { display: none !important; }
          .gh-mobile-icons    { display: flex !important; }

          /* Hide desktop nav row */
          .grocery-desktop-nav-wrapper,
          .grocery-header-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
