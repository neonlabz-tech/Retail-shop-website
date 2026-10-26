'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MegaMenuColumn, MegaCategoryCard } from '@/types/common';
import type { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatPrice';
import { HOME_DEMO_COLUMNS } from '@/data/homeDemoMenu';

function IconArrowLeftS({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
    </svg>
  );
}

function IconArrowRightS({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
    </svg>
  );
}

export interface MegaMenuTheme {
  bg?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  cardBg?: string;
  sliderBtnBg?: string;
  sliderBtnBorder?: string;
  sliderBtnHoverBorder?: string;
  sliderBtnColor?: string;
  sliderOldPriceColor?: string;
  promoTitleColor?: string;
  promoSubtitleColor?: string;
  categoryCountColor?: string;
}

const DEFAULT_THEME: Required<MegaMenuTheme> = {
  bg: '#fff',
  headingColor: '#222',
  linkColor: '#555',
  linkHoverColor: '#F15B41',
  cardBg: '#f7f7f7',
  sliderBtnBg: '#fff',
  sliderBtnBorder: '#e5e5e5',
  sliderBtnHoverBorder: '#222',
  sliderBtnColor: '#222',
  sliderOldPriceColor: '#999',
  promoTitleColor: '#222',
  promoSubtitleColor: '#555',
  categoryCountColor: '#888',
};

function resolveTheme(t?: MegaMenuTheme): Required<MegaMenuTheme> {
  return { ...DEFAULT_THEME, ...t };
}

function MegaMenuColumns({ columns, t, onClose }: { columns: MegaMenuColumn[]; t: Required<MegaMenuTheme>; onClose?: () => void }) {
  return (
    <>
      {columns.map((column, i) => (
        <div key={i}>
          <h4
            className="text-[15px] font-bold mb-[18px]"
            style={{ color: t.headingColor }}
          >
            {column.title}
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-[18px]">
            {column.links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className={`text-[14px] no-underline transition-[color] duration-150 ease-in-out inline-flex items-center gap-[8px] ${
                    link.comingSoon ? 'cursor-default' : ''
                  }`}
                  style={{ color: t.linkColor }}
                  onClick={(e) => {
                    if (link.comingSoon) {
                      e.preventDefault();
                    } else {
                      onClose?.();
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                  }}
                  onMouseEnter={(e) => { if (!link.comingSoon) e.currentTarget.style.color = t.linkHoverColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = t.linkColor; }}
                >
                  {link.label}
                  {link.comingSoon && (
                    <span className="text-[10px] font-semibold text-white bg-[rgba(107,114,128,0.8)] py-[2px] px-[6px] rounded-[4px] tracking-[0.3px] leading-[1.4] shrink-0">
                      Coming Soon
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export interface SliderProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: { src: string }[];
}

function ProductSlider({ products: overrideProducts, hrefBase = '/products', t, onClose }: { products?: SliderProduct[]; hrefBase?: string; t: Required<MegaMenuTheme>; onClose?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dbProducts, setDbProducts] = useState<SliderProduct[]>([]);

  useEffect(() => {
    if (overrideProducts && overrideProducts.length > 0) return;
    let isMounted = true;
    fetch('/api/products?limit=8')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          const formatted: SliderProduct[] = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            images: p.images && p.images.length > 0 ? p.images : [{ src: '' }],
          }));
          setDbProducts(formatted);
        }
      })
      .catch((err) => {
        console.error('Error fetching featured products for MegaMenu:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [overrideProducts]);

  const products: SliderProduct[] = (overrideProducts && overrideProducts.length > 0)
    ? overrideProducts
    : dbProducts;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const step = el.clientWidth / 2 + 8;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-[20px]">
        <h4 className="text-[18px] font-bold" style={{ color: t.headingColor }}>Featured Collection</h4>
        <div className="flex gap-[6px]">
          <button
            onClick={() => scroll('left')}
            className="w-[36px] h-[36px] rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-150"
            style={{
              borderColor: t.sliderBtnBorder,
              background: t.sliderBtnBg,
              color: t.sliderBtnColor,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.sliderBtnHoverBorder; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.sliderBtnBorder; }}
            aria-label="Previous products"
          >
            <IconArrowLeftS size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-[36px] h-[36px] rounded-full border flex items-center justify-center cursor-pointer transition-colors duration-150"
            style={{
              borderColor: t.sliderBtnBorder,
              background: t.sliderBtnBg,
              color: t.sliderBtnColor,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.sliderBtnHoverBorder; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.sliderBtnBorder; }}
            aria-label="Next products"
          >
            <IconArrowRightS size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="grid grid-flow-col auto-cols-[calc(50%-8px)] gap-[16px] overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
      >
        {products.map((product) => {
          const rawImg = product.images?.[0] as any;
          const imgSrc = (typeof rawImg === 'string' ? rawImg : rawImg?.src) || '';
          return (
            <Link
              key={product.id}
              href={`${hrefBase}/${product.slug}`}
              onClick={() => onClose?.()}
              className="no-underline text-inherit snap-start"
            >
              <div
                className="w-full h-[385px] rounded-[6px] overflow-hidden relative mb-[10px]"
                style={{ backgroundColor: t.cardBg }}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="220px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#999] text-[13px] bg-[#f0f0f0]">
                    No image
                  </div>
                )}
              </div>
              <p
                className="text-[14px] font-semibold mb-[4px] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ color: t.linkColor }}
              >
                {product.name}
              </p>
              {(() => {
                const mmDiscount = product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;
                return (
                  <div className="flex items-baseline gap-[6px] flex-wrap">
                    <span className="text-[14px] font-bold text-[#F15B41]">
                      {formatPrice(product.price)}
                    </span>
                    {mmDiscount > 0 && (
                      <span className="text-[#F15B41] bg-[#fff0ed] text-[10px] font-bold px-[4px] py-[1px] rounded-[3px] leading-none">
                        -{mmDiscount}%
                      </span>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-[12px] line-through font-normal" style={{ color: t.sliderOldPriceColor }}>
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                );
              })()}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface MegaMenuProps {
  columns?: MegaMenuColumn[];
  promoImage?: {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
  };
  showProductSlider?: boolean;
  categoryCards?: MegaCategoryCard[];
  sliderProducts?: SliderProduct[];
  sliderHrefBase?: string;
  theme?: MegaMenuTheme;
  onClose?: () => void;
}

export function MegaMenu({ columns, promoImage, showProductSlider, categoryCards, sliderProducts, sliderHrefBase, theme, onClose }: MegaMenuProps) {
  const t = resolveTheme(theme);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('a')) {
      onClose?.();
    }
  };

  if (categoryCards && categoryCards.length > 0) {
    return (
      <div
        onClick={handleContainerClick}
        className="absolute top-full left-[calc(50%-50vw)] right-[calc(50%-50vw)] border-t-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-[300] animate-[menuSlideDown_300ms_ease-out]"
        style={{ backgroundColor: t.bg }}
      >
        <div className="container-main h-[420px] py-[30px] flex items-center">
          <div
            className="grid gap-[24px] w-full"
            style={{ gridTemplateColumns: `repeat(${categoryCards.length}, 1fr)` }}
          >
            {categoryCards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                onClick={() => onClose?.()}
                className="category-card-link no-underline text-inherit text-left"
              >
                <div
                  className="relative w-full h-[280px] overflow-hidden mb-[14px]"
                  style={{ backgroundColor: t.cardBg }}
                >
                  <Image
                    src={card.image}
                    alt={card.label}
                    fill
                    className="object-cover transition-transform duration-400 ease-in-out"
                    sizes="(max-width: 1200px) 33vw, 20vw"
                  />
                </div>

                <span
                  className="category-card-label text-[18px] font-bold relative inline-block pb-[4px] leading-[1.3]"
                  style={{ color: t.headingColor }}
                >
                  {card.label}
                </span>

                {card.itemCount !== undefined && (
                  <p className="text-[14px] mt-[4px] font-normal" style={{ color: t.categoryCountColor }}>
                    {card.itemCount} Items
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        <style>{`
          .category-card-link .category-card-label::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: ${t.headingColor};
            transition: width 300ms ease, left 300ms ease;
          }
          .category-card-link:hover .category-card-label::after {
            width: 100%;
            left: 0;
          }
          .category-card-link:hover img {
            transform: scale(1.05);
          }
        `}</style>
      </div>
    );
  }

  if (showProductSlider && columns) {
    return (
      <div
        onClick={handleContainerClick}
        className="absolute top-full left-[calc(50%-50vw)] right-[calc(50%-50vw)] border-t-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-[300] animate-[menuSlideDown_300ms_ease-out]"
        style={{ backgroundColor: t.bg }}
      >
        <div className="container-main py-[32px]">
          <div className="grid grid-cols-[60%_40%] gap-[40px]">
            <div className="grid grid-cols-4 gap-[24px]">
              <MegaMenuColumns columns={columns} t={t} onClose={onClose} />
            </div>
            <ProductSlider products={sliderProducts} hrefBase={sliderHrefBase} t={t} onClose={onClose} />
          </div>
        </div>
      </div>
    );
  }

  if (promoImage && columns) {
    return (
      <div
        onClick={handleContainerClick}
        className="absolute top-full left-[calc(50%-50vw)] right-[calc(50%-50vw)] border-t-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-[300] animate-[menuSlideDown_300ms_ease-out]"
        style={{ backgroundColor: t.bg }}
      >
        <div className="container-main py-[40px]">
          <div className="grid gap-[24px]" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 1fr` }}>
            <MegaMenuColumns columns={columns} t={t} onClose={onClose} />

            <div className="flex flex-col">
              <div
                className="relative w-full aspect-square rounded-[4px] overflow-hidden"
                style={{ backgroundColor: t.cardBg }}
              >
                <Image
                  src={promoImage.src}
                  alt={promoImage.alt}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="text-center pt-[16px]">
                <p className="text-[16px] font-bold tracking-[1px]" style={{ color: t.promoTitleColor }}>{promoImage.title}</p>
                <p className="text-[13px] mt-[4px] tracking-[1px]" style={{ color: t.promoSubtitleColor }}>{promoImage.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!columns) return null;

  const isDemoMenu = columns.some((c) => c.title && c.title.toLowerCase().startsWith('demo list'));
  const effectiveColumns = isDemoMenu ? HOME_DEMO_COLUMNS : columns;

  return (
    <div
      onClick={handleContainerClick}
      className="absolute top-full left-[calc(50%-50vw)] right-[calc(50%-50vw)] border-t shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-[300] animate-[menuSlideDown_300ms_ease-out]"
      style={{
        backgroundColor: t.bg,
        borderTopColor: t.sliderBtnBorder,
      }}
    >
      <div className="container-main py-[32px]">
        <div
          className={`grid gap-[32px] ${
            effectiveColumns.length <= 2 ? 'grid-cols-[repeat(auto-fit,minmax(220px,280px))]' : ''
          }`}
          style={
            effectiveColumns.length > 2
              ? { gridTemplateColumns: `repeat(${effectiveColumns.length}, 1fr)` }
              : undefined
          }
        >
          <MegaMenuColumns columns={effectiveColumns} t={t} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
