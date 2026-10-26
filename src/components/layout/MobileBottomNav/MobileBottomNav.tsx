'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  getStorefrontFromPath,
  isGrocerySlug,
  isPetFoodSlug,
  isNutritionSlug,
  isMegastoreSlug,
  isCarAccessoriesSlug,
  isPizzaSlug,
  isPlantGardenSlug,
  isSkinCareSlug,
  isJewellerySlug,
  isHeadphonesSlug,
  isSneakerSlug,
  isFurnitureSlug,
  isElegantFashionSlug,
  isLipstainSlug,
  isFootwearSlug,
  isFashion04Slug,
  isFashion03Slug,
  isActiveWearSlug,
  isBackpackSlug,
  isBasketballSlug,
  type Storefront,
} from '@/utils/storefront';

/* ── Icons (Remix Icon-style outlines, match screenshot weight) ── */

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

/* ── Helpers ── */

function homeHrefFor(storefront: Storefront): string {
  switch (storefront) {
    case 'grocery':
      return '/home/grocery-shop';
    case 'pet-food':
      return '/home/pet-food-shop';
    case 'nutrition':
      return '/home/nutrition-shop';
    case 'megastore':
      return '/home/megastore-shop';
    case 'car-accessories':
      return '/home/car-accessories-shop';
    case 'pizza':
      return '/home/pizza-shop';
    case 'plant-garden':
      return '/home/plant-garden-shop';
    case 'skin-care':
      return '/home/skin-care-shop';
    case 'jewellery':
      return '/home/jewellery-shop';
    case 'headphones':
      return '/home/headphones-shop';
    case 'sneaker':
      return '/home/sneaker-shop';
    case 'furniture':
      return '/home/furniture-shop';
    case 'elegant-fashion':
      return '/home/elegant-fashion-shop';
    case 'lipstain':
      return '/home/lipstain-shop';
    case 'smart-watches':
      return '/home/smart-watches-shop';
    case 'electronics-store-2':
      return '/home/electronics-store-2-shop';
    case 'single-product':
      return '/home/single-product-shop';
    case 'footwear':
      return '/home/footwear-shop';
    case 'fashion-04':
      return '/home/fashion-04-shop';
    case 'fashion-03':
      return '/home/fashion-03-shop';
    case 'active-wear':
      return '/home/active-wear-shop';
    case 'backpack':
      return '/home/backpack-shop';
    case 'basketball':
      return '/home/basketball-shop';
    case 'glasses':
      return '/home/glasses-shop';
    case 'plumbing-supplies':
      return '/home/plumbing-supplies-shop';
    case 'book':
      return '/home/book-shop';
    case 'jewelry-2':
      return '/home/jewelry-2-shop';
    case 'coffee':
      return '/home/coffee-shop';
    case 'craft-and-decore':
      return '/home/craft-and-decore-shop';
    case 'rtl-demo':
      return '/home/rtl-demo-shop';
    case 'toys':
      return '/home/toys-shop';
    case 'socks':
      return '/home/socks-shop';
    case 'pod':
      return '/home/pod-shop';
    default:
      return '/';
  }
}

function accentFor(storefront: Storefront): string {
  switch (storefront) {
    case 'grocery':
      return 'rgb(27, 128, 87)';
    case 'pet-food':
      return 'rgb(10, 66, 83)';
    case 'nutrition':
      return '#0e1a0a';
    case 'megastore':
      return '#f26522';
    case 'car-accessories':
      return '#5b72d6';
    case 'pizza':
      return '#e84d1c';
    case 'plant-garden':
      return '#3a7d44';
    case 'skin-care':
      return '#111';
    case 'jewellery':
      return '#b89b6e';
    case 'headphones':
      return '#5de8ff';
    case 'sneaker':
      return '#e84d1c';
    case 'furniture':
      return '#c8a45a';
    case 'elegant-fashion':
      return '#1a2b5e';
    case 'lipstain':
      return '#c9173c';
    case 'smart-watches':
      return '#fc5732';
    case 'electronics-store-2':
      return '#2b6be6';
    case 'single-product':
      return '#1a6fe8';
    case 'footwear':
      return '#F15B41';
    case 'basketball':
      return '#e8521f';
    case 'plumbing-supplies':
      return '#0a2540';
    case 'book':
      return '#e0294a';
    default:
      return '#222';
  }
}

function cartCountForStorefront(
  items: { slug: string; quantity: number }[],
  storefront: Storefront,
) {
  const relevant =
    storefront === 'grocery'
      ? items.filter((i) => isGrocerySlug(i.slug))
      : storefront === 'pet-food'
      ? items.filter((i) => isPetFoodSlug(i.slug))
      : storefront === 'nutrition'
      ? items.filter((i) => isNutritionSlug(i.slug))
      : storefront === 'megastore'
      ? items.filter((i) => isMegastoreSlug(i.slug))
      : storefront === 'car-accessories'
      ? items.filter((i) => isCarAccessoriesSlug(i.slug))
      : storefront === 'pizza'
      ? items.filter((i) => isPizzaSlug(i.slug))
      : storefront === 'plant-garden'
      ? items.filter((i) => isPlantGardenSlug(i.slug))
      : storefront === 'skin-care'
      ? items.filter((i) => isSkinCareSlug(i.slug))
      : storefront === 'jewellery'
      ? items.filter((i) => isJewellerySlug(i.slug))
      : storefront === 'headphones'
      ? items.filter((i) => isHeadphonesSlug(i.slug))
      : storefront === 'sneaker'
      ? items.filter((i) => isSneakerSlug(i.slug))
      : storefront === 'furniture'
      ? items.filter((i) => isFurnitureSlug(i.slug))
      : storefront === 'elegant-fashion'
      ? items.filter((i) => isElegantFashionSlug(i.slug))
      : storefront === 'lipstain'
      ? items.filter((i) => isLipstainSlug(i.slug))
      : storefront === 'footwear'
      ? items.filter((i) => isFootwearSlug(i.slug))
      : storefront === 'fashion-04'
      ? items.filter((i) => isFashion04Slug(i.slug))
      : storefront === 'fashion-03'
      ? items.filter((i) => isFashion03Slug(i.slug))
      : storefront === 'active-wear'
      ? items.filter((i) => isActiveWearSlug(i.slug))
      : storefront === 'backpack'
      ? items.filter((i) => isBackpackSlug(i.slug))
      : storefront === 'basketball'
      ? items.filter((i) => isBasketballSlug(i.slug))
      : items.filter(
          (i) =>
            !isGrocerySlug(i.slug) && !isPetFoodSlug(i.slug) && !isNutritionSlug(i.slug) && !isMegastoreSlug(i.slug) && !isCarAccessoriesSlug(i.slug) && !isPizzaSlug(i.slug) && !isPlantGardenSlug(i.slug) && !isSkinCareSlug(i.slug) && !isJewellerySlug(i.slug) && !isHeadphonesSlug(i.slug) && !isSneakerSlug(i.slug) && !isFurnitureSlug(i.slug) && !isElegantFashionSlug(i.slug) && !isLipstainSlug(i.slug) && !isFootwearSlug(i.slug) && !isFashion04Slug(i.slug) && !isFashion03Slug(i.slug) && !isActiveWearSlug(i.slug) && !isBackpackSlug(i.slug) && !isBasketballSlug(i.slug),
        );
  return relevant.reduce((sum, i) => sum + i.quantity, 0);
}

/* ── Helpers for Category & Products ── */

function categoriesHrefFor(storefront: Storefront): string {
  switch (storefront) {
    case 'grocery': return '/grocery/categories';
    case 'pet-food': return '/pet-food/categories';
    case 'nutrition': return '/nutrition/categories';
    case 'megastore': return '/megastore/categories';
    case 'car-accessories': return '/car-accessories/categories';
    case 'pizza': return '/pizza/categories';
    case 'plant-garden': return '/plant-garden/categories';
    case 'boutique-fashion': return '/boutique-fashion/categories';
    case 'phone-case': return '/phone-case/categories';
    case 'smart-watches': return '/smart-watches/categories';
    default: return '/categories';
  }
}

function productsHrefFor(storefront: Storefront): string {
  switch (storefront) {
    case 'grocery': return '/grocery/shop';
    case 'pet-food': return '/pet-food/shop';
    case 'nutrition': return '/nutrition/shop';
    case 'megastore': return '/megastore/shop';
    case 'car-accessories': return '/car-accessories/shop';
    case 'pizza': return '/pizza/shop';
    case 'plant-garden': return '/plant-garden/shop';
    case 'headphones': return '/headphones/shop';
    case 'boutique-fashion': return '/boutique-fashion/shop';
    case 'phone-case': return '/phone-case/shop';
    case 'smart-watches': return '/smart-watches/shop';
    default: return '/products';
  }
}

/* ── Component ── */

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  const storefront = getStorefrontFromPath(pathname);
  const accent = accentFor(storefront);
  const homeHref = homeHrefFor(storefront);
  const categoriesHref = categoriesHrefFor(storefront);
  const productsHref = productsHrefFor(storefront);
  const accountHref = '/profile';

  const openCart = useCartStore((s) => s.openDrawer);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartCountForStorefront(cartItems, storefront);

  const isHomeActive = pathname === homeHref || (storefront === 'fashion' && pathname === '/');
  const isCategoryActive = pathname === categoriesHref || pathname.includes('/categories') || pathname.includes('/collections');
  const isProductsActive = pathname === productsHref || pathname === '/products' || pathname.startsWith('/products/');
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

        {/* 3. Home (Center Floating Button - no text) */}
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
          color: ${accent === '#222' ? '#0f172a' : accent};
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
          text-align: center;
        }

        :global(.mbn-bar .mbn-item.is-active .mbn-label) {
          font-weight: 600;
          color: ${accent === '#222' ? '#0f172a' : accent};
        }

        :global(.mbn-bar .mbn-icon-wrap) {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        :global(.mbn-bar .mbn-item svg) {
          display: block;
          flex-shrink: 0;
        }

        :global(.mbn-bar .mbn-center-item) {
          flex: 1 1 0%;
          width: 20%;
          min-width: 0;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          position: relative;
          cursor: pointer;
          box-sizing: border-box;
        }

        :global(.mbn-bar .mbn-center-circle) {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          background: ${accent === '#222' ? '#0f172a' : accent};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.08);
          transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 180ms ease;
          box-sizing: border-box;
        }

        :global(.mbn-bar .mbn-center-item:active .mbn-center-circle) {
          transform: translateX(-50%) translateY(2px) scale(0.94);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
        }

        :global(.mbn-bar .mbn-center-item.is-active .mbn-center-circle) {
          box-shadow: 0 0 0 3px ${accent === '#222' ? 'rgba(15, 23, 42, 0.2)' : `${accent}40`}, 0 6px 20px rgba(0, 0, 0, 0.22);
        }

        :global(.mbn-bar .mbn-badge) {
          position: absolute;
          top: -6px;
          right: -10px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9999px;
          background: ${accent === '#222' ? '#0f172a' : accent};
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          border: 2px solid #fff;
          box-sizing: border-box;
        }

        /* Shown only at ≤ 749px */
        @media (max-width: 749px) {
          .mbn-bar { display: flex; }
        }

        /* Hide the bottom nav while a full-height modal/drawer is open
           (body.scroll-locked is set by useLockBodyScroll). Prevents the
           nav from peeking through under a full-viewport drawer on
           devices where 100dvh under-measures, and fixes the UX of a
           background nav being visible under a modal. */
        :global(body.scroll-locked) .mbn-bar {
          display: none !important;
        }
      `}</style>
    </nav>
  );
}
