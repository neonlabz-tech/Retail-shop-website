'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MegaMenu } from './MegaMenu';
import { DropdownMenu } from './DropdownMenu';
import navigationData from '@/data/navigation.json';
import navigationGlasses from '@/data/navigation-glasses.json';
import navigationPlumbingSupplies from '@/data/navigation-plumbing-supplies.json';
import navigationBook from '@/data/navigation-book.json';
import navigationJewelry2 from '@/data/navigation-jewelry-2.json';
import navigationCoffee from '@/data/navigation-coffee.json';
import navigationCraftDecore from '@/data/navigation-craft-and-decore.json';
import navigationToys from '@/data/navigation-toys.json';
import navigationSocks from '@/data/navigation-socks.json';
import navigationPod from '@/data/navigation-pod.json';
import { getStorefrontFromPath } from '@/utils/storefront';
import { singleProductProducts } from '@/data/single-product-products';
import { activeWearProducts } from '@/data/active-wear-products';
import type { SliderProduct } from './MegaMenu';
import type { NavigationItem } from '@/types/common';

const SP_SHOP_MEGA_IMAGE = '/single -product/shop-mega-menu/shop-mega-menu-1.webp';
const SP_CATEGORY_IMAGE = (i: number) => `/single -product/categories-mega-menu/categories-mega-menu-${i + 1}.webp`;
const SP_SLUGS = singleProductProducts.map((p) => p.slug);
const SP_SLIDER_PRODUCTS = singleProductProducts as SliderProduct[];

const AW_SHOP_MEGA_IMAGE = '/active-wear/shop-mega-menu/shop-mega-menu-1.avif';
const AW_CATEGORY_IMAGE = (i: number) => `/active-wear/categories-mega-menu/categories-mega-menu-${i + 1}.webp`;
const AW_SLUGS = activeWearProducts.map((p) => p.slug);
const AW_SLIDER_PRODUCTS = activeWearProducts as SliderProduct[];

const BP_SHOP_MEGA_IMAGE = '/backpack/shop-mega-menu/sjop-mega-menu-1.webp';
const BP_CATEGORY_IMAGE = (i: number) => `/backpack/categories-mega-menu/categories-mega-menu-${i + 1}.webp`;

const BB_SHOP_MEGA_IMAGE = '/basketball/shop-mega-menu/shop-mega-menu-1.webp';
const BB_CATEGORY_IMAGE = (i: number) => `/basketball/categories-mega-menu/categories-mega-menu-${i + 1}.webp`;

function withMegaMenuImages(
  items: NavigationItem[],
  shopImage: string,
  categoryImage: (i: number) => string,
): NavigationItem[] {
  return items.map((item) => {
    if (item.megaImage) {
      return { ...item, megaImage: { ...item.megaImage, src: shopImage } };
    }
    if (item.megaCategoryCards) {
      return {
        ...item,
        megaCategoryCards: item.megaCategoryCards.map((c, i) => ({ ...c, image: categoryImage(i) })),
      };
    }
    return item;
  });
}

function withActiveWearData(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => {
    if (item.megaImage) {
      return { ...item, megaImage: { ...item.megaImage, src: AW_SHOP_MEGA_IMAGE } };
    }
    if (item.megaCategoryCards) {
      return {
        ...item,
        megaCategoryCards: item.megaCategoryCards.map((c, i) => ({ ...c, image: AW_CATEGORY_IMAGE(i) })),
      };
    }
    if (item.megaProductSlider && item.megaMenu) {
      let k = 0;
      const megaMenu = item.megaMenu.map((col) => ({
        ...col,
        links: col.links.map((link) => {
          const href = `/products/${AW_SLUGS[k % AW_SLUGS.length]}`;
          k++;
          return { ...link, href };
        }),
      }));
      return { ...item, href: `/products/${AW_SLUGS[0]}`, megaMenu };
    }
    return item;
  });
}

function withSingleProductData(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => {
    if (item.megaImage) {
      return { ...item, megaImage: { ...item.megaImage, src: SP_SHOP_MEGA_IMAGE } };
    }
    if (item.megaCategoryCards) {
      return {
        ...item,
        megaCategoryCards: item.megaCategoryCards.map((c, i) => ({ ...c, image: SP_CATEGORY_IMAGE(i) })),
      };
    }
    if (item.megaProductSlider && item.megaMenu) {
      let k = 0;
      const megaMenu = item.megaMenu.map((col) => ({
        ...col,
        links: col.links.map((link) => {
          const href = `/products/${SP_SLUGS[k % SP_SLUGS.length]}`;
          k++;
          return { ...link, href };
        }),
      }));
      return { ...item, href: `/products/${SP_SLUGS[0]}`, megaMenu };
    }
    return item;
  });
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
    </svg>
  );
}

export function DesktopNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();

  const storefront = getStorefrontFromPath(pathname);
  const isSingleProduct = storefront === 'single-product';
  const isActiveWear = storefront === 'active-wear';
  const isBackpack = storefront === 'backpack';
  const isBasketball = storefront === 'basketball';
  const isGlasses = storefront === 'glasses';
  const isPlumbingSupplies = storefront === 'plumbing-supplies';
  const isBook = storefront === 'book';
  const isJewelry2 = storefront === 'jewelry-2';
  const isCoffee = storefront === 'coffee';
  const isCraftDecore = storefront === 'craft-and-decore';
  const isToys = storefront === 'toys';
  const isSocks = storefront === 'socks';
  const isPod = storefront === 'pod';
  const navItems = useMemo(() => {
    const base = navigationData as NavigationItem[];
    if (isSingleProduct) return withSingleProductData(base);
    if (isActiveWear) return withActiveWearData(base);
    if (isBackpack) return withMegaMenuImages(base, BP_SHOP_MEGA_IMAGE, BP_CATEGORY_IMAGE);
    if (isBasketball) return withMegaMenuImages(base, BB_SHOP_MEGA_IMAGE, BB_CATEGORY_IMAGE);
    if (isGlasses) return navigationGlasses as NavigationItem[];
    if (isPlumbingSupplies) return navigationPlumbingSupplies as NavigationItem[];
    if (isBook) return navigationBook as NavigationItem[];
    if (isJewelry2) return navigationJewelry2 as NavigationItem[];
    if (isCoffee) return navigationCoffee as NavigationItem[];
    if (isCraftDecore) return navigationCraftDecore as NavigationItem[];
    if (isToys) return navigationToys as NavigationItem[];
    if (isSocks) return navigationSocks as NavigationItem[];
    if (isPod) return navigationPod as NavigationItem[];
    return base;
  }, [isSingleProduct, isActiveWear, isBackpack, isBasketball, isGlasses, isPlumbingSupplies, isBook, isJewelry2, isCoffee, isCraftDecore, isToys, isSocks, isPod]);

  const navColor = isPlumbingSupplies ? '#0a2540' : '#222';
  const navAccent = isPlumbingSupplies ? '#3a5f8a' : '#F15B41';

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(null);
  };

  useEffect(() => {
    handleClose();
  }, [pathname]);

  return (
    <nav className="flex items-center gap-[32px]">
      {navItems.map((item) => {
        if (item.id === 'nav-shop') return null;

        if (item.id === 'nav-blog') return null;

        if (item.id === 'nav-pages') return null;

        const isProducts = item.id === 'nav-products';
        const itemLabel = item.label;
        const itemHref = isProducts ? '/products' : item.href;

        return (
          <div
            key={item.id}
            className="static"
            onMouseEnter={() => {
              if (!isProducts && (item.type === 'dropdown' || item.type === 'megamenu')) {
                handleMouseEnter(item.id);
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
          <Link
            href={itemHref}
            onClick={handleClose}
            className="flex items-center gap-[4px] text-[17px] font-medium no-underline py-[8px] px-0 transition-[color] duration-150 ease-in-out whitespace-nowrap"
            style={{
              color: activeMenu === item.id ? navAccent : navColor,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = navAccent; }}
            onMouseLeave={(e) => {
              if (activeMenu !== item.id) e.currentTarget.style.color = navColor;
            }}
          >
            {itemLabel}
            {!isProducts && item.id !== 'nav-categories' && (item.type === 'dropdown' || item.type === 'megamenu') && (
              <span
                className={`inline-flex transition-transform duration-300 ease-in-out ${
                  activeMenu === item.id ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <IconChevronDown />
              </span>
            )}
          </Link>

          {!isProducts && item.id !== 'nav-categories' && item.type === 'megamenu' && (item.megaMenu || item.megaCategoryCards) && activeMenu === item.id && (
            <MegaMenu
              columns={item.megaMenu}
              promoImage={item.megaImage}
              showProductSlider={item.megaProductSlider}
              categoryCards={item.megaCategoryCards}
              sliderProducts={isSingleProduct ? SP_SLIDER_PRODUCTS : isActiveWear ? AW_SLIDER_PRODUCTS : [
                {
                  id: '6ad5f6860e445000414fa0d5',
                  slug: 'gold-silver-plated-granted-charm-bracelet',
                  name: 'Gold & Silver Plated Granted Charm Bracelet (European Pandora Style)',
                  price: 1250,
                  compareAtPrice: 1550,
                  images: [{ src: 'https://pub-a517fd63737142cbb39ca30df8bc77f0.r2.dev/products/1792484317347-7da77223-4a96-4b72-b8e6-9cd39b1aa356.png' }],
                },
                {
                  id: '6ad5f6820e445000414fa0cf',
                  slug: 'mini-handheld-fan-daisy-flower-accent-with-removable-stand',
                  name: 'Mini Handheld Fan (Daisy Flower Accent with Removable Stand)',
                  price: 450,
                  compareAtPrice: 650,
                  images: [{ src: 'https://pub-a517fd63737142cbb39ca30df8bc77f0.r2.dev/products/1792407158549-a3f3ec62-1010-46dc-8868-547b807584d4.png' }],
                },
                {
                  id: '6ad5f67e0e445000414fa0c9',
                  slug: 'portable-desktop-fan-ultra-thin-folding-stand',
                  name: 'Portable Desktop Fan (Ultra-Thin Folding Stand)',
                  price: 475,
                  compareAtPrice: 600,
                  images: [{ src: 'https://pub-a517fd63737142cbb39ca30df8bc77f0.r2.dev/products/1792407167386-42072d33-a778-40dc-9045-1879d3235c02.png' }],
                },
                {
                  id: '6ad5f6750e445000414fa0c4',
                  slug: 'sweet-bunny-kids-stationery-set-with-coin-purse',
                  name: 'Sweet Bunny Kids Stationery Set with Coin Purse',
                  price: 240,
                  compareAtPrice: 320,
                  images: [{ src: 'https://pub-a517fd63737142cbb39ca30df8bc77f0.r2.dev/products/1792407140539-02d7d3ca-9078-4b58-9d90-dbd2c5dadc8a.png' }],
                },
              ]}
              sliderHrefBase={isSingleProduct || isActiveWear ? '/products' : undefined}
              onClose={handleClose}
            />
          )}

          {item.type === 'dropdown' && item.children && activeMenu === item.id && (
            <DropdownMenu items={item.children} onClose={handleClose} />
          )}
        </div>
        );
      })}
    </nav>
  );
}
