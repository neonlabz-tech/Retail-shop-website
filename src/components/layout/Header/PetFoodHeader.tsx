'use client';

import Link from 'next/link';
import { GroceryAnnouncementBar } from './GroceryAnnouncementBar';
import { Logo } from './Logo';
import { PetFoodDesktopNav } from './PetFoodDesktopNav';
import { PetFoodHeaderActions } from './PetFoodHeaderActions';
import { SearchBar } from './SearchBar';
import { MobileNav } from './MobileNav';
import { useUIStore } from '@/store/uiStore';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

function IconFeatures({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12 23C16.1421 23 19.5 19.6421 19.5 15.5C19.5 14.6345 19.2697 13.8032 19 13.0296C17.3333 14.6765 16.0667 15.5 15.2 15.5C19.1954 8.5 17 5.5 11 1.5C11.5 6.49951 8.20403 8.77375 6.86179 10.0366C5.40786 11.4045 4.5 13.3462 4.5 15.5C4.5 19.6421 7.85786 23 12 23ZM12.7094 5.23498C15.9511 7.98528 15.9666 10.1223 13.463 14.5086C12.702 15.8419 13.6648 17.5 15.2 17.5C15.8884 17.5 16.5841 17.2992 17.3189 16.9051C16.6979 19.262 14.5519 21 12 21C8.96243 21 6.5 18.5376 6.5 15.5C6.5 13.9608 7.13279 12.5276 8.23225 11.4932C8.35826 11.3747 8.99749 10.8081 9.02477 10.7836C9.44862 10.4021 9.7978 10.0663 10.1429 9.69677C11.3733 8.37932 12.2571 6.91631 12.7094 5.23498Z" />
    </svg>
  );
}

export function PetFoodHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <GroceryAnnouncementBar backgroundColor="rgb(10, 66, 83)" />

      <header
        className="pet-food-main-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: '#fff',
          overflow: 'visible',
        }}
      >
        {/* Row 1: Logo | Search | Actions */}
        <div className="pet-food-header-top">
          <div
            className="container-main pet-food-header-top-grid"
            style={{
              height: '82px',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              alignItems: 'center',
            }}
          >
            <div className="pet-food-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifySelf: 'start' }}>
              <button
                onClick={openMobileMenu}
                aria-label="Open menu"
                className="pet-food-mobile-menu-btn"
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
              <div className="pet-food-logo-wrap pet-food-logo-desktop">
                <Logo href="/home/pet-food-shop" />
              </div>
            </div>

            <div className="pet-food-search-wrap" style={{ width: '100%' }}>
              <SearchBar />
            </div>

            {/* Mobile-only centered logo — sits in the middle column below 992px */}
            <div className="pet-food-logo-mobile">
              <Logo href="/home/pet-food-shop" />
            </div>

            <PetFoodHeaderActions />
          </div>
        </div>

        {/* Row 2: Nav (far left) | Utility links (far right) */}
        <div className="pet-food-header-nav">
          <div
            className="container-main pet-food-nav-row"
          >
            <div className="pet-food-desktop-nav-wrapper">
              <PetFoodDesktopNav />
            </div>

            <div className="pet-food-utility">
              <span className="pet-food-utility-droplet" aria-hidden="true">
                <IconFeatures size={22} />
              </span>
              <Link href="#" className="pet-food-utility-link">Features</Link>
              <span className="pet-food-utility-sep" aria-hidden="true">|</span>
              <Link href="#" className="pet-food-utility-link">FAQs</Link>
            </div>
          </div>
        </div>
      </header>

      <MobileNav />

      {/* Mobile search row */}
      <div className="pet-food-mobile-search-row">
        <div className="container-main" style={{ padding: '10px 16px' }}>
          <SearchBar />
        </div>
      </div>

      <style jsx global>{`
        .pet-food-main-header { background-color: #fff; }
        /* Desktop-only sticky reinforcement — inline sets position: sticky;
           this explicit rule pins the header to the viewport top at >= 992px
           and avoids flicker during scroll. */
        @media (min-width: 992px) {
          .pet-food-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }
        .pet-food-header-top { background-color: #fff; border-bottom: 1px solid #eee; }
        .pet-food-header-nav { background-color: #fff; }

        .pet-food-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          /* Spacing between the nav and utility column shrinks gradually
             between 992 and 1200 so both stay inside the container without
             snapping. */
          gap: clamp(12px, 2vw, 24px);
        }
        .pet-food-desktop-nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex: 0 1 auto;
          margin-right: auto;
        }

        .pet-food-utility {
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.4vw, 18px);
          color: rgb(10, 66, 83);
          font-size: clamp(14px, 1.4vw, 18px);
          margin-left: auto;
          flex-shrink: 0;
        }
        .pet-food-utility-droplet {
          color: rgb(10, 66, 83);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 2px;
        }
        .pet-food-utility-link {
          color: rgb(10, 66, 83);
          text-decoration: none;
          font-size: clamp(14px, 1.4vw, 18px);
          font-weight: 500;
          transition: color 180ms ease, opacity 180ms ease;
        }
        .pet-food-utility-link:hover { opacity: 0.75; }
        .pet-food-utility-sep {
          color: rgb(10, 66, 83);
          opacity: 0.35;
          font-weight: 400;
          font-size: clamp(14px, 1.4vw, 18px);
        }

        .pet-food-mobile-search-row {
          display: none;
          border-bottom: 1px solid #eee;
          background-color: #fff;
        }
        .pet-food-logo-mobile { display: none; }
        @media (max-width: 991px) {
          .pet-food-mobile-menu-btn { display: flex !important; }
          .pet-food-desktop-nav-wrapper,
          .pet-food-header-nav { display: none !important; }
          .pet-food-search-wrap { display: none !important; }
          /* Desktop logo in the left cluster hides on mobile; mobile logo sits in
             the center column so the grid reads: menu | logo | actions. */
          .pet-food-logo-desktop { display: none !important; }
          .pet-food-logo-mobile {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .pet-food-logo-mobile img {
            width: 80px !important;
            height: auto !important;
          }
          /* Mobile search is now an icon in the right cluster that opens the
             SearchDrawer; the separate mobile search row is no longer needed. */
          .pet-food-mobile-search-row { display: none; }
        }
      `}</style>
    </>
  );
}
