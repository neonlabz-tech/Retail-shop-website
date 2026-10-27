'use client';

import Link from 'next/link';
import { GroceryAnnouncementBar } from './GroceryAnnouncementBar';
import { Logo } from './Logo';
import { CarAccessoriesDesktopNav } from './CarAccessoriesDesktopNav';
import { CarAccessoriesHeaderActions } from './CarAccessoriesHeaderActions';
import { SearchBar } from './SearchBar';
import { CarAccessoriesMobileNav } from './CarAccessoriesMobileNav';
import { useUIStore } from '@/store/uiStore';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

export function CarAccessoriesHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <GroceryAnnouncementBar backgroundColor="#111" />

      <header
        className="ca-main-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#fff',
          overflow: 'visible',
        }}
      >
        {/* Row 1: Logo | Search | Actions */}
        <div className="ca-header-top">
          <div
            className="container-main ca-header-top-grid"
            style={{
              height: '82px',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              alignItems: 'center',
            }}
          >
            <div className="ca-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifySelf: 'start' }}>
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="ca-mobile-menu-btn"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#222',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <IconMenu />
              </button>
              <div className="ca-logo-wrap ca-logo-desktop">
                <Logo href="/home/car-accessories-shop" />
              </div>
            </div>

            <div className="ca-search-wrap" style={{ width: '100%' }}>
              <SearchBar />
            </div>

            {/* Mobile-only centered logo */}
            <div className="ca-logo-mobile">
              <Logo href="/home/car-accessories-shop" />
            </div>

            <CarAccessoriesHeaderActions />
          </div>
        </div>

        {/* Row 2: Nav (far left) | Utility links (far right) */}
        <div className="ca-header-nav">
          <div className="container-main ca-nav-row">
            <div className="ca-desktop-nav-wrapper">
              <CarAccessoriesDesktopNav />
            </div>

            <div className="ca-utility">
              <Link href="#" className="ca-utility-link">Features</Link>
              <span className="ca-utility-sep" aria-hidden="true">|</span>
              <Link href="/car-accessories/faq" className="ca-utility-link">FAQs</Link>
            </div>
          </div>
        </div>
      </header>

      <CarAccessoriesMobileNav />

      <style jsx global>{`
        .ca-main-header { background-color: #fff; }
        @media (min-width: 992px) {
          .ca-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }
        .ca-header-top { background-color: #fff; border-bottom: 1px solid #eee; }
        .ca-header-nav { background-color: #fff; }

        .ca-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          gap: clamp(12px, 2vw, 24px);
        }
        .ca-desktop-nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex: 0 1 auto;
          margin-right: auto;
        }

        .ca-utility {
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.4vw, 18px);
          color: #111;
          font-size: clamp(14px, 1.4vw, 18px);
          margin-left: auto;
          flex-shrink: 0;
        }
        .ca-utility-link {
          color: #111;
          text-decoration: none;
          font-size: clamp(14px, 1.4vw, 18px);
          font-weight: 500;
          transition: color 180ms ease, opacity 180ms ease;
        }
        .ca-utility-link:hover { color: #5b72d6; }
        .ca-utility-sep {
          color: #111;
          opacity: 0.35;
          font-weight: 400;
          font-size: clamp(14px, 1.4vw, 18px);
        }

        .ca-logo-mobile { display: none; }
        @media (max-width: 991px) {
          .ca-mobile-menu-btn { display: flex !important; }
          .ca-desktop-nav-wrapper,
          .ca-header-nav { display: none !important; }
          .ca-search-wrap { display: none !important; }
          .ca-logo-desktop { display: none !important; }
          .ca-logo-mobile {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .ca-logo-mobile img {
            width: 80px !important;
            height: auto !important;
          }
        }
      `}</style>
    </>
  );
}
