'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCompareStore } from '@/store/compareStore';
import { useUIStore } from '@/store/uiStore';
import { isSneakerSlug, isSneakerProductId } from '@/utils/storefront';
import { AccountDropdown } from './AccountDropdown';

const ACCENT = '#e84d1c';

function IconSearch({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
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

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        position: 'absolute',
        top: '-9px',
        right: '-10px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        borderRadius: '9999px',
        backgroundColor: ACCENT,
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        border: '2px solid #fff',
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
  transition: 'color 180ms ease, transform 180ms ease',
};

function hoverIn(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.color = ACCENT;
  e.currentTarget.style.transform = 'translateY(-2px)';
}
function hoverOut(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.color = '#222';
  e.currentTarget.style.transform = 'translateY(0)';
}

export function SneakerHeaderActions() {
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const openSearch = useUIStore((s) => s.openSearch);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const compareItems = useCompareStore((s) => s.items);

  const snCartItems = cartItems.filter((i) => isSneakerSlug(i.slug));
  const snWishlistItems = wishlistItems.filter((i) => isSneakerSlug(i.slug));
  void compareItems.filter((i) => isSneakerProductId(i.id));
  const totalCartItems = snCartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', justifySelf: 'end' }}>
      <button onClick={openSearch} style={iconBtnStyle} aria-label="Open search" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <IconSearch />
      </button>
      <AccountDropdown hoverColor={ACCENT} />
      <Link href="/wishlist" style={{ ...iconBtnStyle, textDecoration: 'none' }} aria-label="Wishlist" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <IconHeart />
        {snWishlistItems.length > 0 && <CountBadge count={snWishlistItems.length} />}
      </Link>
      <button onClick={openCartDrawer} style={iconBtnStyle} aria-label="Open cart" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <IconShoppingBag />
        <CountBadge count={totalCartItems} />
      </button>
    </div>
  );
}
