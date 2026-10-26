'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from './AnnouncementBar';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { HeaderActions } from './HeaderActions';
import { MobileNav } from './MobileNav';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { isBookSlug } from '@/utils/storefront';
import { useClickOutside } from '@/hooks/useClickOutside';

/* Book header — 3-row light layout matching the screenshot:
   • Fashion AnnouncementBar (#111): social + welcome + lang/currency
   • Row 1 (white): logo · "All Tags" + search + search button · actions + red "Book Request"
   • Row 2 (white): "All Categories" · Home/Shop/Categories/Products/Blog/Pages · phone
   DesktopNav / HeaderActions / MobileNav are the shared, storefront-aware
   components, so nav data, drawers and counts scope to Book automatically via
   getStorefrontFromPath. */

const RED = '#e0294a';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={28} height={28}>
      <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

function IconSearch({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

function IconBag({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}

function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z" />
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

/* ── Search bar with "All Tags" dropdown ── */
const TAG_OPTIONS = ['All Tags', 'Fiction', 'Non-Fiction', "Children's", 'Business', 'Design'];

function BookSearchBar() {
  const { openSearch } = useUIStore();
  const [tag, setTag] = useState('All Tags');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <form className="bkh-search" onSubmit={(e) => { e.preventDefault(); openSearch(); }} role="search">
      <div className="bkh-tags" ref={ref}>
        <button type="button" className="bkh-tags-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {tag}
          <IconChevronDown size={14} />
        </button>
        {open && (
          <ul className="bkh-tags-menu">
            {TAG_OPTIONS.map((t) => (
              <li key={t}>
                <button type="button" onClick={() => { setTag(t); setOpen(false); }}>{t}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        type="text"
        placeholder="What are you looking for..."
        onClick={openSearch}
        readOnly
        aria-label="Search"
        className="bkh-search-input"
      />
      <button type="submit" aria-label="Submit search" className="bkh-search-btn">
        <IconSearch size={20} />
      </button>
    </form>
  );
}

/* ── Compact "All Categories" dropdown ── */
const BOOK_CATEGORIES = [
  { label: 'Featured', href: '/shop?category=Featured' },
  { label: 'New Arrivals', href: '/shop?category=New Arrivals' },
  { label: 'Bestsellers', href: '/shop?category=Bestsellers' },
  { label: 'Popular', href: '/shop?category=Popular' },
  { label: 'Fiction', href: '/shop' },
  { label: 'Non-Fiction', href: '/shop' },
  { label: "Children's Books", href: '/shop' },
  { label: 'Business & Money', href: '/shop' },
  { label: 'Art & Design', href: '/shop' },
];

function BookAllCategories() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="bkh-acb" ref={ref}>
      <button className="bkh-acb-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <IconMenu />
        <span>All Categories</span>
      </button>
      {open && (
        <div className="bkh-acb-panel" role="menu">
          {BOOK_CATEGORIES.map((c) => (
            <Link key={c.label} href={c.href} className="bkh-acb-item" onClick={() => setOpen(false)}>
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BookMobileIcons() {
  const { openSearch } = useUIStore();
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.filter((i) => isBookSlug(i.slug)).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bkh-mobile-icons">
      <button onClick={openSearch} aria-label="Search" className="bkh-mobile-icon-btn"><IconSearch size={24} /></button>
      <button onClick={openCartDrawer} aria-label="Open cart" className="bkh-mobile-icon-btn bkh-mobile-cart">
        <IconBag size={24} />
        {cartCount > 0 && <span className="bkh-mobile-badge">{cartCount}</span>}
      </button>
    </div>
  );
}

export function BookHeader() {
  const { openMobileMenu } = useUIStore();

  return (
    <>
      <AnnouncementBar backgroundColor="#111" />

      <header className="bkh-main-header">
        {/* Row 1: Logo | Search | Actions + Book Request */}
        <div className="bkh-top">
          <div className="container-main bkh-top-inner">
            <div className="bkh-left">
              <button onClick={openMobileMenu} aria-label="Open menu" className="bkh-mobile-menu-btn">
                <IconMenu />
              </button>
              <span className="bkh-desktop-logo">
                <Logo href="/home/book-shop" />
              </span>
            </div>

            <div className="bkh-center">
              <div className="bkh-search-wrap">
                <BookSearchBar />
              </div>
              <span className="bkh-mobile-logo">
                <Logo href="/home/book-shop" />
              </span>
            </div>

            <div className="bkh-right">
              <span className="bkh-desktop-actions">
                <HeaderActions />
                <Link href="/pages/contact" className="bkh-request-btn">Book Request</Link>
              </span>
              <BookMobileIcons />
            </div>
          </div>
        </div>

        {/* Row 2: All Categories | Nav | Call Us (desktop only) */}
        <div className="bkh-nav">
          <div className="container-main bkh-nav-grid">
            <div className="bkh-nav-cats">
              <BookAllCategories />
            </div>
            <div className="bkh-nav-links">
              <DesktopNav />
            </div>
            <a href="tel:+0256305686145" className="bkh-callus">
              <span className="bkh-callus-icon"><IconHeadphones size={22} /></span>
              <span className="bkh-callus-number">025630 56861 45</span>
            </a>
          </div>
        </div>
      </header>

      <MobileNav />

      <style jsx global>{`
        .bkh-main-header {
          position: sticky;
          top: 0;
          z-index: 200;
          background-color: #fff;
          overflow: visible;
        }
        @media (min-width: 992px) {
          .bkh-main-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            will-change: transform;
          }
        }

        .bkh-top { background-color: #fdf6f5; border-bottom: 1px solid #f0e4e4; }
        .bkh-top-inner {
          height: 90px;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          gap: 24px;
        }
        .bkh-left { display: flex; align-items: center; gap: 12px; justify-self: start; }
        .bkh-center { width: 100%; }
        .bkh-right { justify-self: end; }
        .bkh-desktop-actions { display: flex; align-items: center; gap: 22px; }
        .bkh-request-btn {
          display: inline-flex;
          align-items: center;
          background: ${RED};
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          padding: 13px 26px;
          border-radius: 40px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 200ms ease;
        }
        .bkh-request-btn:hover { background: #b81f3b; }

        .bkh-mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          color: #222;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .bkh-mobile-logo, .bkh-mobile-icons { display: none; }

        /* ── Search bar ── */
        .bkh-search {
          display: flex;
          align-items: center;
          width: 100%;
          height: 52px;
          background: #fff;
          border: 1.5px solid #e6d7d7;
          border-radius: 6px;
          overflow: visible;
          position: relative;
          transition: border-color 200ms ease;
        }
        .bkh-search:focus-within { border-color: ${RED}; }
        .bkh-tags { position: relative; flex-shrink: 0; height: 100%; }
        .bkh-tags-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 100%;
          padding: 0 16px;
          font-size: 14px;
          color: #333;
          background: none;
          border: none;
          border-right: 1px solid #eee;
          cursor: pointer;
          white-space: nowrap;
        }
        .bkh-tags-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 160px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          list-style: none;
          margin: 0;
          padding: 6px 0;
          z-index: 60;
        }
        .bkh-tags-menu button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 9px 16px;
          font-size: 14px;
          color: #333;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 150ms ease, color 150ms ease;
        }
        .bkh-tags-menu button:hover { background: #fdf1f3; color: ${RED}; }
        .bkh-search-input {
          flex: 1;
          height: 100%;
          padding: 0 18px;
          font-size: 14px;
          color: #222;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
        }
        .bkh-search-input::placeholder { color: #9a8f8f; }
        .bkh-search-btn {
          height: 100%;
          width: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 200ms ease;
        }
        .bkh-search-btn:hover { color: ${RED}; }

        /* ── Nav row ── */
        .bkh-nav { background: #fff; border-bottom: 1px solid #eee; }
        .bkh-nav-grid {
          display: grid;
          grid-template-columns: 20% 60% 20%;
          align-items: center;
          height: 66px;
        }
        .bkh-nav-cats { justify-self: start; }
        .bkh-nav-links { display: flex; justify-content: center; }

        /* All Categories */
        .bkh-acb { position: relative; }
        .bkh-acb-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #222;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          white-space: nowrap;
          transition: color 200ms ease;
        }
        .bkh-acb-btn:hover, .bkh-acb-btn[aria-expanded="true"] { color: ${RED}; }
        .bkh-acb-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 240px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          box-shadow: 0 14px 36px rgba(0,0,0,0.13);
          padding: 6px 0;
          z-index: 500;
        }
        .bkh-acb-item {
          display: block;
          padding: 10px 18px;
          font-size: 14.5px;
          color: #333;
          text-decoration: none;
          transition: background 140ms ease, color 140ms ease;
        }
        .bkh-acb-item:hover { background: #fdf1f3; color: ${RED}; }

        /* Call Us */
        .bkh-callus {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          justify-self: end;
          text-decoration: none;
          color: #222;
          font-size: 16px;
          font-weight: 600;
          transition: color 200ms ease;
        }
        .bkh-callus-icon { color: ${RED}; display: inline-flex; }
        .bkh-callus:hover { color: ${RED}; }

        /* Mobile icons */
        .bkh-mobile-icons { align-items: center; gap: 18px; }
        .bkh-mobile-icon-btn {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; padding: 0; color: #222; cursor: pointer;
          transition: color 180ms ease;
        }
        .bkh-mobile-icon-btn:hover { color: ${RED}; }
        .bkh-mobile-cart { position: relative; }
        .bkh-mobile-badge {
          position: absolute; top: -6px; right: -6px;
          min-width: 16px; height: 16px; padding: 0 4px;
          border-radius: 9999px; background: ${RED}; color: #fff;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; line-height: 1;
        }

        /* ── Mobile ≤ 991px ── */
        @media (max-width: 991px) {
          .bkh-top-inner {
            grid-template-columns: auto 1fr auto;
            height: 64px;
            gap: 0;
          }
          .bkh-mobile-menu-btn { display: flex !important; }
          .bkh-desktop-logo { display: none; }
          .bkh-center { display: flex; justify-content: center; align-items: center; }
          .bkh-search-wrap { display: none !important; }
          .bkh-mobile-logo { display: inline-flex; }
          .bkh-desktop-actions { display: none !important; }
          .bkh-mobile-icons { display: flex !important; }
          .bkh-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
