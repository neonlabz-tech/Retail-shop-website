'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from '@/components/ui/Drawer';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { getStorefrontFromPath, isGrocerySlug, isPetFoodSlug, isNutritionSlug, isMegastoreSlug, isPhoneCaseSlug, isSmartWatchesSlug, type Storefront } from '@/utils/storefront';
import { ALL_CATEGORIES } from './AllCategoriesButton';
import { MEGASTORE_CATEGORIES } from './MegastoreAllCategoriesButton';
import { formatPrice } from '@/utils/formatPrice';
import { HeaderLanguageCurrency } from './HeaderLanguageCurrency';

import navigationFashion from '@/data/navigation.json';
import navigationGrocery from '@/data/navigation-grocery.json';
import navigationPetFood from '@/data/navigation-pet-food.json';
import navigationNutrition from '@/data/navigation-nutrition.json';
import navigationMegastore from '@/data/navigation-megastore.json';
import navigationPhoneCase from '@/data/navigation-phone-case.json';
import navigationSmartWatches from '@/data/navigation-smart-watches.json';
import navigationFootwear from '@/data/navigation-footwear.json';
import navigationGlasses from '@/data/navigation-glasses.json';
import navigationPlumbingSupplies from '@/data/navigation-plumbing-supplies.json';
import navigationBook from '@/data/navigation-book.json';
import navigationJewelry2 from '@/data/navigation-jewelry-2.json';
import navigationCoffee from '@/data/navigation-coffee.json';
import navigationCraftDecore from '@/data/navigation-craft-and-decore.json';
import navigationToys from '@/data/navigation-toys.json';
import navigationSocks from '@/data/navigation-socks.json';
import navigationPod from '@/data/navigation-pod.json';
import { HOME_DEMO_COLUMNS } from '@/data/homeDemoMenu';

import type { NavigationItem, MegaMenuColumn } from '@/types/common';

function IconPlus({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      fill="none"
      viewBox="0 0 10 10"
      width="16"
      height="16"
      className={`absolute transition-[opacity,transform] duration-350 ease-in-out ${
        open ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
      }`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMinus({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      fill="none"
      viewBox="0 0 10 2"
      width="16"
      height="16"
      className={`absolute transition-[opacity,transform] duration-350 ease-in-out ${
        open ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
      }`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z"
        fill="currentColor"
      />
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

function IconUser({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" />
    </svg>
  );
}

function IconClose({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12 10.5858L16.9497 5.63604L18.364 7.05025L13.4142 12L18.364 16.9497L16.9497 18.364L12 13.4142L7.05025 18.364L5.63604 16.9497L10.5858 12L5.63604 7.05025L7.05025 5.63604L12 10.5858Z" />
    </svg>
  );
}

function pickNav(storefront: Storefront): NavigationItem[] {
  switch (storefront) {
    case 'grocery':        return navigationGrocery as NavigationItem[];
    case 'pet-food':       return navigationPetFood as NavigationItem[];
    case 'nutrition':      return navigationNutrition as NavigationItem[];
    case 'megastore':      return navigationMegastore as NavigationItem[];
    case 'phone-case':     return navigationPhoneCase as NavigationItem[];
    case 'smart-watches':  return navigationSmartWatches as NavigationItem[];
    case 'footwear':       return navigationFootwear as NavigationItem[];
    case 'glasses':        return navigationGlasses as NavigationItem[];
    case 'plumbing-supplies': return navigationPlumbingSupplies as NavigationItem[];
    case 'book':           return navigationBook as NavigationItem[];
    case 'jewelry-2':      return navigationJewelry2 as NavigationItem[];
    case 'coffee':         return navigationCoffee as NavigationItem[];
    case 'craft-and-decore': return navigationCraftDecore as NavigationItem[];
    case 'toys':            return navigationToys as NavigationItem[];
    case 'socks':           return navigationSocks as NavigationItem[];
    case 'pod':             return navigationPod as NavigationItem[];
    default:               return navigationFashion as NavigationItem[];
  }
}

function storefrontAccent(storefront: Storefront) {
  switch (storefront) {
    case 'grocery':   return { primary: 'rgb(27, 128, 87)', text: 'rgb(27, 128, 87)' };
    case 'pet-food':  return { primary: 'rgb(10, 66, 83)',  text: 'rgb(10, 66, 83)' };
    case 'nutrition': return { primary: '#0e1a0a',          text: '#0e1a0a' };
    case 'megastore': return { primary: '#f26522',          text: '#111' };
    default:          return { primary: '#222',             text: '#222' };
  }
}

function wishlistHrefFor(storefront: Storefront): string {
  switch (storefront) {
    case 'grocery':        return '/grocery/wishlist';
    case 'pet-food':       return '/pet-food/wishlist';
    case 'nutrition':      return '/nutrition/wishlist';
    case 'megastore':      return '/megastore/wishlist';
    case 'phone-case':     return '/phone-case/wishlist';
    case 'smart-watches':  return '/smart-watches/wishlist';
    case 'footwear':       return '/wishlist';
    default:               return '/wishlist';
  }
}

function filterWishlistForStorefront(items: { slug: string }[], storefront: Storefront) {
  if (storefront === 'grocery')        return items.filter((i) => isGrocerySlug(i.slug));
  if (storefront === 'pet-food')       return items.filter((i) => isPetFoodSlug(i.slug));
  if (storefront === 'nutrition')      return items.filter((i) => isNutritionSlug(i.slug));
  if (storefront === 'megastore')      return items.filter((i) => isMegastoreSlug(i.slug));
  if (storefront === 'phone-case')     return items.filter((i) => isPhoneCaseSlug(i.slug));
  if (storefront === 'smart-watches')  return items.filter((i) => isSmartWatchesSlug(i.slug));
  return items.filter(
    (i) =>
      !isGrocerySlug(i.slug) &&
      !isPetFoodSlug(i.slug) &&
      !isNutritionSlug(i.slug) &&
      !isMegastoreSlug(i.slug) &&
      !isPhoneCaseSlug(i.slug) &&
      !isSmartWatchesSlug(i.slug),
  );
}

function categoriesTheme(storefront: Storefront) {
  if (storefront === 'megastore') {
    return {
      iconCircleBg: '#f5f5f5',
      labelColor: '#111',
      l1ToggleColor: '#f26522',
      l2RowBg: '#fafafa',
      l3RowBg: '#f5f5f5',
      l2ToggleColor: '#555',
    };
  }
  return {
    iconCircleBg: '#f0f5f0',
    labelColor: '#1B8057',
    l1ToggleColor: '#1B8057',
    l2RowBg: '#f9faf8',
    l3RowBg: '#f4f6f3',
    l2ToggleColor: '#555',
  };
}

function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows_500ms_cubic-bezier(0.25,0.46,0.45,0.94),opacity_400ms_cubic-bezier(0.25,0.46,0.45,0.94)] ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

function ToggleIcon({ open, color = '#555' }: { open: boolean; color?: string }) {
  return (
    <span
      className="relative w-[16px] h-[16px] inline-flex items-center justify-center"
      style={{ color }}
    >
      <IconPlus open={open} />
      <IconMinus open={open} />
    </span>
  );
}

interface AccordionRowProps {
  label: string;
  href?: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  accent: { primary: string; text: string };
  depth?: 0 | 1;
  hasChildren: boolean;
}

function AccordionRow({
  label, href, isOpen, onToggle, onNavigate, accent, depth = 0, hasChildren,
}: AccordionRowProps) {
  const rowItemClass = `flex-1 flex min-w-0 items-center py-[14px] font-medium ${
    depth === 0 ? 'px-[20px] text-[15px]' : 'px-[36px] text-[14px]'
  }`;
  const color = depth === 0 ? accent.text : accent.primary;

  return (
    <div className="flex items-stretch justify-between border-b border-[#eee]">
      {href ? (
        <Link
          href={href}
          onClick={onNavigate}
          className={`${rowItemClass} no-underline`}
          style={{ color }}
        >
          {label}
        </Link>
      ) : (
        <span className={rowItemClass} style={{ color }}>
          {label}
        </span>
      )}
      {hasChildren && (
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
          className="w-[54px] shrink-0 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
        >
          <ToggleIcon open={isOpen} color={accent.text} />
        </button>
      )}
    </div>
  );
}

export function MobileNav() {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname  = usePathname();
  const storefront = getStorefrontFromPath(pathname);
  const navItems   = pickNav(storefront);
  const accent     = storefrontAccent(storefront);
  const wishlistHref = wishlistHrefFor(storefront);
  const wishlistItems  = useWishlistStore((s) => s.items);
  const visibleWishlist = filterWishlistForStorefront(wishlistItems, storefront);

  const [openTop, setOpenTop] = useState<Record<string, boolean>>({});
  const [openCol, setOpenCol] = useState<Record<string, boolean>>({});
  const toggleTop = (id: string)  => setOpenTop((p) => ({ ...p, [id]: !p[id] }));
  const toggleCol = (key: string) => setOpenCol((p) => ({ ...p, [key]: !p[key] }));

  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string; slug: string; subcategories: string[] }>>([]);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/categories')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setDbCategories(
            data.categories.map((c: any) => ({
              id: c.id || c._id || c.name,
              name: c.name,
              slug: c.slug || c.name,
              subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
            }))
          );
        }
      })
      .catch((err) => console.error('Error fetching categories for MobileNav:', err));


    return () => {
      isMounted = false;
    };
  }, []);

  const [activeTab,  setActiveTab]  = useState<'menu' | 'categories'>('menu');
  const [openCatL1,  setOpenCatL1]  = useState<Record<string, boolean>>({});
  const [openCatL2,  setOpenCatL2]  = useState<Record<string, boolean>>({});

  const close = () => {
    closeMobileMenu();
    setTimeout(() => {
      setOpenTop({});
      setOpenCol({});
      setActiveTab('menu');
      setOpenCatL1({});
      setOpenCatL2({});
    }, 400);
  };

  const hasCategoriesTab = storefront === 'grocery' || storefront === 'megastore';

  type AnyCategoryEntry = {
    id: string;
    label: string;
    href: string;
    icon?: string;
    iconNode?: React.ReactNode;
    megaColumns?: { heading: string; items: Array<{ label: string; href: string }> }[];
    subItems?: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>;
  };
  const categoriesData: AnyCategoryEntry[] =
    storefront === 'megastore' ? (MEGASTORE_CATEGORIES as AnyCategoryEntry[]) : (ALL_CATEGORIES as AnyCategoryEntry[]);
  const catTheme = categoriesTheme(storefront);

  function getCatL2(cat: AnyCategoryEntry) {
    if (cat.megaColumns) {
      return cat.megaColumns.map((col, i) => ({
        key: `${cat.id}-${i}`,
        label: col.heading,
        href: cat.href,
        l3: col.items as Array<{ label: string; href: string }>,
      }));
    }
    if (cat.subItems) {
      return cat.subItems.map((sub, i) => ({
        key: `${cat.id}-${i}`,
        label: sub.label,
        href: sub.href,
        l3: (sub.children ?? []) as Array<{ label: string; href: string }>,
      }));
    }
    return [];
  }

  return (
    <Drawer isOpen={mobileMenuOpen} onClose={close} side="start" width="55rem">

      {hasCategoriesTab ? (
        <div className="flex items-center gap-[10px] py-[14px] px-[16px] border-b border-[#eee] shrink-0">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-[8px] px-[20px] text-[14px] font-semibold rounded-[40px] cursor-pointer transition-[background,color] duration-200 ease-in-out [-webkit-tap-highlight-color:transparent] ${
              activeTab === 'menu'
                ? 'border-none bg-[#222] text-white'
                : 'border-[1.5px] border-[#d0d0d0] bg-transparent text-[#222]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-[8px] px-[20px] text-[14px] font-semibold rounded-[40px] cursor-pointer transition-[background,color] duration-200 ease-in-out [-webkit-tap-highlight-color:transparent] ${
              activeTab === 'categories'
                ? 'border-none bg-[#222] text-white'
                : 'border-[1.5px] border-[#d0d0d0] bg-transparent text-[#222]'
            }`}
          >
            Categories
          </button>
          <button
            onClick={close}
            aria-label="Close menu"
            className="ml-auto w-[44px] h-[44px] border-none bg-transparent text-[#222] cursor-pointer flex items-center justify-center"
          >
            <IconClose size={26} />
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between py-[10px] pr-[12px] pl-[20px] border-b border-[#eee]">
          <Link href="/" onClick={close} className="inline-flex items-center">
            <Image src="/rkf-logo.png" alt="RKF Distributer" width={110} height={54} className="object-contain h-[42px] w-auto" />
          </Link>
          <button
            onClick={close}
            aria-label="Close menu"
            className="w-[44px] h-[44px] mr-[-4px] border-none bg-transparent cursor-pointer flex items-center justify-center"
            style={{ color: accent.text }}
          >
            <IconClose size={30} />
          </button>
        </div>
      )}

      {(!hasCategoriesTab || activeTab === 'menu') && (
        <>
          <nav>
            {navItems.map((item) => {
              if (item.id === 'nav-shop') return null;

              if (item.id === 'nav-blog') return null;

              if (item.id === 'nav-pages') return null;
              const isCategoriesItem = item.id === 'nav-categories';
              const isProductsItem = item.id === 'nav-products';
              const itemLabel = item.label;
              const linkHref = isProductsItem
                ? '/products'
                : (item.href && item.href !== '#' ? item.href : undefined);

              const columns: MegaMenuColumn[] = isCategoriesItem
                  ? dbCategories.map((cat) => ({
                      title: cat.name,
                      links: cat.subcategories.map((sub, idx) => ({
                        id: `${cat.id}-sub-${idx}`,
                        label: sub,
                        href: `/products?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`,
                      })),
                    }))
                  : isProductsItem
                    ? []
                    : (item.megaMenu ?? []);
              const flatChildren = item.children ?? [];
              const categoryCards = isCategoriesItem ? [] : (item.megaCategoryCards ?? []);
              const hasChildren =
                !isProductsItem &&
                (columns.length > 0 ||
                flatChildren.length > 0 ||
                categoryCards.length > 0);
              const isTopOpen = !!openTop[item.id];

              return (
                <div key={item.id}>
                  <AccordionRow
                    label={itemLabel}
                    href={linkHref}
                    isOpen={isTopOpen}
                    onToggle={() => toggleTop(item.id)}
                    onNavigate={close}
                    accent={accent}
                    depth={0}
                    hasChildren={hasChildren}
                  />
                  {hasChildren && (
                    <Collapse open={isTopOpen}>
                      {columns.map((col, ci) => {
                        const colKey = `${item.id}::${ci}`;
                        const isColOpen = !!openCol[colKey];
                        const hasLinks = col.links.length > 0;
                        const colHref = isCategoriesItem
                          ? `/products?category=${encodeURIComponent(col.title)}`
                          : undefined;
                        return (
                          <div key={colKey}>
                            <AccordionRow
                              label={col.title}
                              href={colHref}
                              isOpen={isColOpen}
                              onToggle={() => toggleCol(colKey)}
                              onNavigate={close}
                              accent={accent}
                              depth={1}
                              hasChildren={hasLinks}
                            />
                            {hasLinks && (
                              <Collapse open={isColOpen}>
                                {col.links.map((l) => (
                                  <Link
                                    key={l.id}
                                    href={l.href}
                                    onClick={(e) => {
                                      if (l.comingSoon) {
                                        e.preventDefault();
                                      } else {
                                        close();
                                        window.scrollTo({ top: 0, behavior: 'instant' });
                                      }
                                    }}
                                    className={`flex items-center gap-[8px] py-[14px] px-[52px] text-[14px] font-medium no-underline border-b border-[#f0f0f0] ${
                                      l.comingSoon ? 'cursor-default' : ''
                                    }`}
                                    style={{ color: accent.text }}
                                  >
                                    {l.label}
                                    {l.comingSoon && (
                                      <span className="text-[10px] font-semibold text-white bg-[rgba(107,114,128,0.8)] py-[2px] px-[6px] rounded-[4px] tracking-[0.3px] leading-[1.4] shrink-0">
                                        Coming Soon
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </Collapse>
                            )}
                          </div>
                        );
                      })}
                      {flatChildren.map((c) => (
                        <Link
                          key={c.id}
                          href={c.href}
                          onClick={close}
                          className="block py-[14px] px-[36px] text-[14px] font-medium no-underline border-b border-[#f0f0f0]"
                          style={{ color: accent.text }}
                        >
                          {c.label}
                        </Link>
                      ))}
                      {categoryCards.map((c) => (
                        <Link
                          key={c.id}
                          href={c.href}
                          onClick={close}
                          className="block py-[14px] px-[36px] text-[14px] font-medium no-underline border-b border-[#f0f0f0]"
                          style={{ color: accent.text }}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </Collapse>
                  )}
                </div>
              );
            })}
          </nav>

          <Link
            href={wishlistHref}
            onClick={close}
            className="flex min-h-[56px] items-center gap-[10px] py-[14px] px-[20px] border-b border-[#eee] no-underline text-[15px] font-medium"
            style={{ color: accent.text }}
          >
            <span className="relative inline-flex">
              <IconHeart size={22} />
              <span
                className="absolute top-[-8px] right-[-10px] min-w-[18px] h-[18px] px-[5px] py-0 rounded-full text-white text-[10px] font-bold inline-flex items-center justify-center border-[2px] border-white leading-none"
                style={{ background: accent.primary }}
              >
                {visibleWishlist.length}
              </span>
            </span>
            Wishlist
          </Link>

          <section className="px-[20px] pt-[20px] pb-[16px]">
            <Link
              href="/profile"
              onClick={close}
              className="text-[20px] leading-[1.3] font-bold mt-0 mx-0 mb-[14px] block no-underline hover:opacity-80 transition-opacity"
              style={{ color: accent.text }}
            >
              My account
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex min-h-[52px] items-center justify-center gap-[10px] w-full min-w-0 text-white border-none rounded-[40px] py-[12px] px-[16px] text-[15px] font-semibold cursor-pointer mb-[10px] no-underline"
                  style={{ background: accent.primary }}
                >
                  <IconUser size={18} />
                  <span className="min-w-0 truncate">Profile ({user?.firstName || 'My Account'})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    close();
                  }}
                  className="block min-h-[52px] w-full bg-transparent border-[1.5px] rounded-[40px] py-[12px] px-[16px] text-[15px] font-semibold cursor-pointer mb-[16px]"
                  style={{ color: accent.text, borderColor: '#e5e7eb' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="flex min-h-[52px] items-center justify-center gap-[10px] w-full text-white border-none rounded-[40px] py-[12px] px-[16px] text-[15px] font-semibold cursor-pointer mb-[10px] no-underline"
                  style={{ background: accent.primary }}
                >
                  <IconUser size={18} />
                  <span>Log in</span>
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="block min-h-[52px] w-full bg-transparent border-[1.5px] rounded-[40px] py-[12px] px-[16px] text-[15px] font-semibold cursor-pointer mb-[16px] text-center no-underline"
                  style={{ color: accent.text, borderColor: accent.primary }}
                >
                  Register
                </Link>
              </>
            )}

            <div className="pt-[12px] border-t border-[#eee] flex items-center justify-start">
              <HeaderLanguageCurrency />
            </div>
          </section>
        </>
      )}

      {hasCategoriesTab && activeTab === 'categories' && (
        <div>
          {categoriesData.map((cat) => {
            const isL1Open  = !!openCatL1[cat.id];
            const hasChildren = !!(cat.megaColumns?.length || cat.subItems?.length);
            const l2Items   = getCatL2(cat);

            const iconCell = (
              <span
                className="relative w-[32px] h-[32px] rounded-full overflow-hidden shrink-0 inline-flex items-center justify-center"
                style={{ background: catTheme.iconCircleBg, color: catTheme.labelColor }}
              >
                {cat.iconNode
                  ? cat.iconNode
                  : cat.icon
                    ? <Image src={cat.icon} alt={cat.label} fill className="object-contain" sizes="32px" />
                    : null}
              </span>
            );

            const labelCell = (
              <span
                className="text-[15px] font-semibold flex-1 min-w-0"
                style={{ color: catTheme.labelColor }}
              >
                {cat.label}
              </span>
            );

            const innerClass = 'flex-1 flex items-center gap-[14px] py-[12px] px-[16px] min-h-[56px] no-underline';

            return (
              <div key={cat.id} className="border-b border-[#eee]">

                <div className="flex items-stretch">
                  {hasChildren ? (
                    <span className={innerClass}>
                      {iconCell}
                      {labelCell}
                    </span>
                  ) : (
                    <Link href={cat.href} onClick={close} className={innerClass}>
                      {iconCell}
                      {labelCell}
                    </Link>
                  )}
                  {hasChildren && (
                    <button
                      onClick={() => setOpenCatL1((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                      aria-expanded={isL1Open}
                      aria-label={isL1Open ? `Collapse ${cat.label}` : `Expand ${cat.label}`}
                      className="w-[52px] shrink-0 flex items-center justify-center bg-transparent border-none cursor-pointer [-webkit-tap-highlight-color:transparent]"
                    >
                      <ToggleIcon open={isL1Open} color={catTheme.l1ToggleColor} />
                    </button>
                  )}
                </div>

                {hasChildren && (
                  <Collapse open={isL1Open}>
                    {l2Items.map((l2) => {
                      const isL2Open = !!openCatL2[l2.key];
                      const hasL3    = l2.l3.length > 0;

                      return (
                        <div key={l2.key} style={{ background: catTheme.l2RowBg }}>

                          <div className="flex items-stretch border-t border-[#efefef]">
                            {hasL3 ? (
                              <span className="flex-1 flex items-center py-[14px] pr-[16px] pl-[50px] text-[14px] font-medium text-[#333] min-h-[50px]">
                                {l2.label}
                              </span>
                            ) : (
                              <Link href={l2.href} onClick={close} className="flex-1 flex items-center py-[14px] pr-[16px] pl-[50px] text-[14px] font-medium text-[#333] min-h-[50px] no-underline">
                                {l2.label}
                              </Link>
                            )}
                            {hasL3 && (
                              <button
                                onClick={() => setOpenCatL2((p) => ({ ...p, [l2.key]: !p[l2.key] }))}
                                aria-expanded={isL2Open}
                                aria-label={isL2Open ? `Collapse ${l2.label}` : `Expand ${l2.label}`}
                                className="w-[52px] shrink-0 flex items-center justify-center bg-transparent border-none cursor-pointer [-webkit-tap-highlight-color:transparent]"
                              >
                                <ToggleIcon open={isL2Open} color={catTheme.l2ToggleColor} />
                              </button>
                            )}
                          </div>

                          {hasL3 && (
                            <Collapse open={isL2Open}>
                              {l2.l3.map((l3, idx) => (
                                <Link
                                  key={`${l2.key}-l3-${idx}`}
                                  href={l3.href}
                                  onClick={close}
                                  className="block py-[12px] pr-[16px] pl-[66px] text-[13px] font-normal text-[#666] no-underline border-t border-[#efefef]"
                                  style={{ background: catTheme.l3RowBg }}
                                >
                                  {l3.label}
                                </Link>
                              ))}
                            </Collapse>
                          )}
                        </div>
                      );
                    })}
                  </Collapse>
                )}
              </div>
            );
          })}
        </div>
      )}

    </Drawer>
  );
}
