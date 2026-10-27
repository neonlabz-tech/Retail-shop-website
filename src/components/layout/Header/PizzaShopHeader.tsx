'use client';

import Link from 'next/link';
import { GroceryAnnouncementBar } from './GroceryAnnouncementBar';
import { Logo } from './Logo';
import { PizzaShopDesktopNav } from './PizzaShopDesktopNav';
import { PizzaShopHeaderActions } from './PizzaShopHeaderActions';
import { SearchBar } from './SearchBar';
import { PizzaShopMobileNav } from './PizzaShopMobileNav';
import { useUIStore } from '@/store/uiStore';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

export function PizzaShopHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <GroceryAnnouncementBar backgroundColor="rgb(20,20,20)" />

      <header
        className="ps-main-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: 'rgb(20,20,20)',
          overflow: 'visible',
        }}
      >
        {/* Row 1: Logo | Search | Actions */}
        <div className="ps-header-top">
          <div
            className="container-main ps-header-top-grid"
            style={{
              height: '90px',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              alignItems: 'center',
            }}
          >
            <div className="ps-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifySelf: 'start' }}>
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="ps-mobile-menu-btn"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <IconMenu />
              </button>
              <div className="ps-logo-wrap ps-logo-desktop">
                <Logo href="/home/pizza-shop" src="/pizza/logo/logo1.png" alt="Pizza Shop" />
              </div>
            </div>

            <div className="ps-search-wrap" style={{ width: '100%' }}>
              <SearchBar />
            </div>

            {/* Mobile-only centered logo */}
            <Link href="/home/pizza-shop" className="ps-logo-mobile" style={{ display: 'none', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
              <Logo href="/home/pizza-shop" src="/pizza/logo/logo1.png" alt="Pizza Shop" />
            </Link>

            <PizzaShopHeaderActions />
          </div>
        </div>

        {/* Row 2: Desktop Nav */}
        <div className="ps-header-nav">
          <div className="container-main ps-nav-row">
            <div className="ps-desktop-nav-wrapper">
              <PizzaShopDesktopNav />
            </div>

            <div className="ps-utility">
              <Link href="/pizza/faq" className="ps-utility-link">FAQs</Link>
              <span className="ps-utility-sep" aria-hidden="true">|</span>
              <Link href="/pizza/store-location" className="ps-utility-link">Find a Store</Link>
            </div>
          </div>
        </div>
      </header>

      <PizzaShopMobileNav />

      <style jsx global>{`
        .ps-main-header { background-color: rgb(20,20,20); }
        @media (min-width: 992px) {
          .ps-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }
        .ps-header-top { background-color: rgb(20,20,20); border-bottom: 1px solid #2a2a2a; }
        .ps-header-nav { background-color: rgb(20,20,20); border-bottom: 1px solid #2a2a2a; }

        /* SearchBar styled for dark pizza header */
        .ps-header-top .hdr-search { background-color: rgb(20,20,20); border: 1.5px solid #3a3a3a; }
        .ps-header-top .hdr-search:hover { border-color: #666; }
        .ps-header-top .hdr-search:focus-within { border-color: #e84d1c; background-color: rgb(20,20,20); }
        .ps-header-top .hdr-search-input { color: #fff; }
        .ps-header-top .hdr-search-input::placeholder { color: rgba(255,255,255,0.4); }
        .ps-header-top .hdr-search-btn { color: rgba(255,255,255,0.6); }
        .ps-header-top .hdr-search-btn:hover { color: #e84d1c; }

        .ps-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          gap: clamp(12px, 2vw, 24px);
        }
        .ps-desktop-nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex: 0 1 auto;
          margin-right: auto;
        }

        .ps-utility {
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.4vw, 18px);
          margin-left: auto;
          flex-shrink: 0;
        }
        .ps-utility-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: clamp(13px, 1.2vw, 15px);
          font-weight: 500;
          transition: color 180ms ease;
        }
        .ps-utility-link:hover { color: #e84d1c; }
        .ps-utility-sep {
          color: rgba(255,255,255,0.25);
          font-weight: 400;
          font-size: 14px;
        }

        .ps-logo-mobile { display: none !important; }
        @media (max-width: 991px) {
          .ps-mobile-menu-btn { display: flex !important; }
          .ps-desktop-nav-wrapper,
          .ps-header-nav { display: none !important; }
          .ps-search-wrap { display: none !important; }
          .ps-logo-desktop { display: none !important; }
          .ps-logo-mobile {
            display: flex !important;
            justify-content: center;
            align-items: center;
          }
          .ps-logo-mobile img {
            width: 80px !important;
            height: auto !important;
          }
        }
      `}</style>
    </>
  );
}
