'use client';

import { GroceryAnnouncementBar } from './GroceryAnnouncementBar';
import { Logo } from './Logo';
import { LipstainDesktopNav } from './LipstainDesktopNav';
import { LipstainHeaderActions } from './LipstainHeaderActions';
import { LipstainMobileNav } from './LipstainMobileNav';
import { SearchBar } from './SearchBar';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { isLipstainSlug } from '@/utils/storefront';

const ACCENT = '#c9173c';

const LS_ANNOUNCEMENTS = [
  "Free Delivery on orders over £120. Don't miss discount.",
  'New arrivals! Shop the latest lipstain collection →',
  'Use code BEAUTY15 for 15% off your first order →',
];

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
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

function IconShoppingBag({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}

function LsMobileIcons() {
  const { openSearch } = useUIStore();
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems
    .filter((i) => isLipstainSlug(i.slug))
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="ls-mobile-icons">
      <button
        onClick={openSearch}
        aria-label="Search"
        style={{ background: 'none', border: 'none', padding: 0, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 180ms ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}
      >
        <IconSearch size={24} />
      </button>
      <button
        onClick={openCartDrawer}
        aria-label="Open cart"
        style={{ background: 'none', border: 'none', padding: 0, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'color 180ms ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}
      >
        <IconShoppingBag size={24} />
        {cartCount > 0 && (
          <span style={{ position: 'absolute', top: '-9px', right: '-10px', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '9999px', backgroundColor: ACCENT, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, border: '2px solid #fff' }}>
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

export function LipstainHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <GroceryAnnouncementBar backgroundColor="#111" announcements={LS_ANNOUNCEMENTS} />

      <header
        className="ls-main-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#fff',
          overflow: 'visible',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}
      >
        {/* Row 1: Search | Logo | Actions */}
        <div className="ls-header-top">
          <div className="container-main ls-top-inner">

            {/* Left: hamburger (mobile only) + search bar (desktop only) */}
            <div className="ls-col-left">
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="ls-mobile-menu-btn"
                style={{ display: 'none', alignItems: 'center', justifyContent: 'center', color: '#222', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                <IconMenu />
              </button>
              <div className="ls-search-wrap">
                <SearchBar />
              </div>
            </div>

            {/* Center: Logo */}
            <div className="ls-col-center">
              <Logo href="/home/lipstain-shop" />
            </div>

            {/* Right: desktop actions / mobile icons */}
            <div className="ls-col-right">
              <span className="ls-desktop-actions">
                <LipstainHeaderActions />
              </span>
              <LsMobileIcons />
            </div>

          </div>
        </div>

        {/* Row 2: Nav + Call Us (desktop only) */}
        <div className="ls-header-nav">
          <div className="container-main ls-nav-flex">
            <LipstainDesktopNav />
            <a href="tel:+842500888333" className="ls-callus">
              <span className="ls-callus-label">Need help? Call Us:</span>
              <span className="ls-callus-number">+84 2500 888 33</span>
            </a>
          </div>
        </div>
      </header>

      <LipstainMobileNav />

      <style jsx global>{`
        @media (min-width: 921px) {
          .ls-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }

        /* ── Row 1 ── */
        .ls-header-top {
          border-bottom: 1px solid #f0f0f0;
        }
        .ls-top-inner {
          height: 90px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
        }
        .ls-col-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ls-search-wrap {
          flex: 1;
          max-width: 420px;
        }
        .ls-search-wrap .hdr-search:hover {
          border-color: transparent !important;
        }
        .ls-search-wrap .hdr-search:focus-within {
          border-color: ${ACCENT} !important;
        }
        .ls-search-wrap .hdr-search-btn:hover {
          color: ${ACCENT} !important;
        }
        .ls-col-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ls-col-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .ls-mobile-icons {
          display: none;
          align-items: center;
          gap: 18px;
        }

        /* ── Row 2 ── */
        .ls-header-nav {
          border-top: 1px solid #f0f0f0;
        }
        .ls-nav-flex {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Call Us ── */
        .ls-callus {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ls-callus-label {
          color: #555;
          font-weight: 400;
        }
        .ls-callus-number {
          font-weight: 700;
          color: ${ACCENT};
          position: relative;
        }
        .ls-callus-number::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1.5px;
          background-color: ${ACCENT};
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 300ms ease;
        }
        .ls-callus:hover .ls-callus-number::after {
          transform: scaleX(1);
        }

        /* ── Mobile ≤ 920px ── */
        @media (max-width: 920px) {
          .ls-top-inner {
            height: 64px;
            grid-template-columns: auto 1fr auto;
            gap: 0;
          }
          .ls-mobile-menu-btn { display: flex !important; }
          .ls-search-wrap { display: none !important; }
          .ls-col-center { justify-content: center; }
          .ls-desktop-actions { display: none !important; }
          .ls-mobile-icons { display: flex !important; }
          .ls-header-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
