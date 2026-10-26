'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatPrice';
import { useUIStore } from '@/store/uiStore';
import { useCompareStore } from '@/store/compareStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { Product } from '@/types/product';
import { FALLBACK_IMAGE_SRC, handleImageError } from '@/lib/imageFallback';

function IconHeart({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z" />
    </svg>
  );
}

function IconCompare({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="15 4 19 4 19 8" />
      <line x1="14.75" y1="9.25" x2="19" y2="4" />
      <line x1="5" y1="19" x2="9" y2="15" />
      <polyline points="15 19 19 19 19 15" />
      <line x1="5" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function IconEye({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z" />
    </svg>
  );
}

function IconBag({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
    </svg>
  );
}

interface CountdownTimerProps {
  backgroundColor?: string;
}

export function CountdownTimer({ backgroundColor = '#000' }: CountdownTimerProps = {}) {
  const [time, setTime] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });

  useEffect(() => {
    const getTargetTime = () => {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7;
      target.setDate(now.getDate() + (daysUntilSunday === 0 ? 0 : daysUntilSunday));
      target.setHours(23, 59, 59, 999);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 7);
      }
      return target.getTime();
    };

    const target = getTargetTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fc-countdown flex gap-[5px]">
      {[
        { val: time.days, label: 'Days' },
        { val: time.hrs, label: 'Hrs' },
        { val: time.min, label: 'Min' },
        { val: time.sec, label: 'Sec' },
      ].map((t) => (
        <div key={t.label} className="fc-countdown-cell text-[#fff] rounded-[4px] py-[6px] px-[10px] text-center min-w-[42px]" style={{ backgroundColor }}>
          <div className="fc-countdown-val text-[16px] font-bold leading-[1.3]">{t.val}</div>
          <div className="fc-countdown-lbl text-[11px] font-normal leading-[1.3] opacity-85">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ScrollingText() {
  return (
    <div className="overflow-hidden bg-[#000] py-[10px] px-0 w-full">
      <div className="animate-marquee flex whitespace-nowrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="text-[14px] text-[#fff] font-medium mr-[40px] inline-flex items-center gap-[6px]">
            <span className="text-[16px]">★</span> HOT SALE ITEM &nbsp;&nbsp; <span className="text-[16px]">★</span> UP TO 50% OFF &nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  index: number;
  hrefBase?: string;
  showCountdown?: boolean;
  showScrollText?: boolean;
  imageHeight?: string;
  themeColor?: string;
  countdownBg?: string;
  compact?: boolean;
}

export function HomeProductCard({
  product,
  index,
  hrefBase = '/products',
  showCountdown,
  showScrollText,
  imageHeight,
  themeColor,
  countdownBg,
  compact = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const { openQuickView } = useUIStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const defaultImg1 = product.images[0]?.src || FALLBACK_IMAGE_SRC;
  const defaultImg2 = product.images[1]?.src || defaultImg1;
  const hasCountdown = showCountdown ?? false;
  const hasScrollText = showScrollText ?? false;
  const productHref = `${hrefBase}/${product.slug}`;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const colorImages = product.colors.reduce<Record<string, string>>((acc, c) => {
    const variant = product.variants.find(v => v.color === c.name);
    if (variant) acc[c.name] = variant.image;
    return acc;
  }, {});
  const activeColorImage = hoveredColor ? colorImages[hoveredColor] : null;

  const priceColor = themeColor ?? '#e01117';
  const chipColor = themeColor ?? '#F15B41';
  const tooltipBg = themeColor ?? '#222';

  return (
    <div
      className={`fc-card fc-unified-card group relative w-full h-full min-w-0 max-w-full bg-white rounded-[10px] border border-[#e5e7eb] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:border-[#cbd5e1] flex flex-col justify-between${compact ? ' fc-card--compact' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredColor(null); }}
      style={{ ['--fc-tooltip-bg' as string]: tooltipBg }}
    >
      <Link
        href={productHref}
        className={`fc-card-img-link block relative overflow-hidden bg-white w-full border-b border-[#f1f5f9]${imageHeight ? '' : ' aspect-square'}`}
        style={imageHeight ? { height: imageHeight } : undefined}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-[8px]">
          <Image
            src={defaultImg1}
            alt={product.name}
            fill
            onError={handleImageError}
            className={`object-contain object-center p-[8px] transition-[opacity,transform] duration-500 ease-out ${hovered ? 'scale-108' : 'scale-100'} ${activeColorImage ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 749px) 50vw, 25vw"
          />

          {Object.entries(colorImages).map(([colorName, imgSrc]) => (
            <Image
              key={colorName}
              src={imgSrc}
              alt={`${product.name} ${colorName}`}
              fill
              onError={handleImageError}
              className={`object-contain object-center p-[8px] transition-[opacity,transform] duration-500 ease-out ${hovered ? 'scale-108' : 'scale-100'} ${
                hoveredColor === colorName ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]'
              }`}
              sizes="(max-width: 749px) 50vw, 25vw"
            />
          ))}
        </div>

        {product.badge && (
          <span
            className={`absolute top-[10px] left-[10px] text-[#fff] text-[11px] font-semibold py-[3px] px-[8px] rounded-[3px] z-[3] capitalize ${
              product.badge === 'new' ? 'bg-[#222]' : 'bg-[#e01117]'
            }`}
          >
            {product.badge}
          </span>
        )}

        <div
          className={`fc-actions-overlay absolute top-[10px] right-[10px] flex flex-col gap-[6px] z-[3] transition-[opacity,transform] duration-300 ease-in-out ${
            hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[10px]'
          }`}
        >
          <div className="fc-tooltip-wrap relative">
            <button aria-label="Wishlist" className={`fc-action-btn ${inWishlist ? 'fc-action-btn-dark' : 'fc-action-btn-light'}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ productId: product.id, name: product.name, price: product.price, compareAtPrice: product.compareAtPrice, image: defaultImg1, image2: defaultImg2, slug: product.slug, badge: product.badge, colors: product.colors.map(c => ({ name: c.name, value: c.value })), vendor: product.vendor }); }}>
              <IconHeart size={18} />
            </button>
            <span className="fc-tooltip">{inWishlist ? 'Already Wishlisted' : 'Wishlist'}</span>
          </div>
          <div className="fc-tooltip-wrap fc-quickview-wrap relative">
            <button aria-label="Quick view" className="fc-action-btn fc-action-btn-light" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}><IconEye size={18} /></button>
            <span className="fc-tooltip">Quick view</span>
          </div>
          <div className="fc-tooltip-wrap fc-quickadd-wrap relative">
            <button aria-label="Quick Add" className="fc-action-btn fc-action-btn-light" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}><IconBag size={18} /></button>
            <span className="fc-tooltip">Quick Add</span>
          </div>
        </div>

        {hasCountdown && (
          <div
            className={`absolute bottom-[10px] left-1/2 -translate-x-1/2 z-[3] transition-opacity duration-300 ease-in-out ${
              hovered ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
          >
            <CountdownTimer backgroundColor={countdownBg} />
          </div>
        )}

        {hasScrollText && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-[3] transition-opacity duration-300 ease-in-out ${
              hovered ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
          >
            <ScrollingText />
          </div>
        )}
      </Link>

      <div className="fc-card-body p-[10px] min-[750px]:p-[12px] flex flex-col flex-1 justify-between text-left bg-white">
        <div className="fc-card-title-wrap h-[36px] min-[750px]:h-[38px] overflow-hidden mb-[6px]">
          <Link
            href={productHref}
            title={product.name}
            className="fc-product-title-link text-[13px] min-[750px]:text-[14px] leading-[1.35] font-semibold text-[#1e293b] no-underline transition-colors duration-150 ease-in-out hover:text-[#e01117] block"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex items-baseline gap-[6px]">
            <span className="product-price-text text-[15px] min-[750px]:text-[16px] font-bold text-[#e01117] leading-tight" style={{ color: priceColor }}>
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="min-h-[18px] flex items-center gap-[6px] text-[12px] mt-[3px]">
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="text-[#94a3b8] line-through font-normal">
                  {formatPrice(product.compareAtPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-[#e01117] font-semibold">
                    -{discount}%
                  </span>
                )}
              </>
            ) : null}
          </div>

          {product.colors.length > 0 && (
            <div className="mt-[8px] flex items-center gap-[5px] relative">
              {product.colors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  onMouseEnter={() => setHoveredColor(c.name)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={`w-[14px] h-[14px] rounded-full inline-block cursor-pointer transition-[border-color,transform] duration-200 ease-in-out relative border ${
                    hoveredColor === c.name
                      ? 'border-[2px] border-[#222] scale-[1.25]'
                      : c.value === '#FFFFFF'
                      ? 'border border-[#ddd] scale-100'
                      : 'border border-transparent scale-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              {product.colors.length > 3 && <span className="text-[11px] font-medium text-[#64748b]">+{product.colors.length - 3}</span>}
              {hoveredColor && (
                <span
                  className="absolute bottom-[calc(100%+6px)] left-0 text-[#fff] text-[11px] font-medium py-[3px] px-[8px] rounded-[4px] whitespace-nowrap pointer-events-none animate-[fadeIn_150ms_ease]"
                  style={{ backgroundColor: tooltipBg }}
                >
                  {hoveredColor}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fc-card.fc-unified-card .fc-product-title-link {
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          word-break: break-word !important;
          line-height: 1.35 !important;
          max-height: 2.7em !important;
        }

        .fc-card.fc-unified-card .fc-card-img-link {
          background-color: #ffffff !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          border-radius: 9px 9px 0 0 !important;
          box-shadow: none !important;
          margin-bottom: 0 !important;
        }
        .fc-card.fc-unified-card:hover .fc-card-img-link {
          background-color: #ffffff !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          box-shadow: none !important;
        }
        .fc-card.fc-unified-card .fc-card-img-link img {
          object-fit: contain !important;
          padding: 8px !important;
          transition: transform 500ms cubic-bezier(0.2, 0, 0.2, 1) !important;
        }
        .fc-card.fc-unified-card:hover .fc-card-img-link img {
          transform: scale(1.08) !important;
        }

        .fc-action-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          padding: 0 !important;
          transition: background-color 200ms ease, color 200ms ease, transform 200ms ease, box-shadow 200ms ease !important;
        }
        .fc-action-btn:hover { transform: scale(1.08) !important; }

        .fc-action-btn-light {
          background-color: #fff !important;
          color: #333 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
        }
        .fc-action-btn-light:hover { background-color: #222 !important; color: #fff !important; }

        .fc-action-btn-dark {
          background-color: #222 !important;
          color: #fff !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .fc-action-btn-dark:hover { background-color: #000 !important; }

        .fc-tooltip {
          position: absolute !important;
          right: calc(100% + 8px) !important;
          top: 50% !important;
          transform: translateY(-50%) translateX(6px) !important;
          background-color: var(--fc-tooltip-bg, #222) !important;
          color: #fff !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          padding: 5px 10px !important;
          border-radius: 4px !important;
          white-space: nowrap !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 200ms ease, transform 200ms ease !important;
        }
        .fc-tooltip-wrap:hover .fc-tooltip {
          opacity: 1 !important;
          transform: translateY(-50%) translateX(0) !important;
        }

        .fc-mobile-actions {
          display: none;
        }

        @media (max-width: 749px) {
          .fc-card.fc-unified-card > a:first-child {
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            margin-bottom: 0 !important;
          }
          .fc-card.fc-unified-card > a:first-child img {
            background-color: #ffffff !important;
            padding: 6px !important;
          }
          .fc-actions-overlay {
            opacity: 1 !important;
            transform: none !important;
          }
          .fc-action-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .fc-action-btn svg {
            width: 15px !important;
            height: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
