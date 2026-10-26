'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

function IconCheck({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function useCountdown(active: boolean) {
  const [time, setTime] = useState({ days: 467, hrs: 19, min: 52, sec: 12 });
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTime((t) => ({
        days: t.days,
        hrs: t.hrs,
        min: t.min,
        sec: t.sec > 0 ? t.sec - 1 : 59,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  return time;
}

interface GroceryProductCardProps {
  product: Product;
  /** Explicit countdown toggle. Falls back to `index === 0` when not provided. */
  showCountdown?: boolean;
  /** Used to auto-show countdown on the first item when `showCountdown` is undefined. */
  index?: number;
  /** Base href for the product detail page. Default: `/grocery/product`. */
  hrefBase?: string;
}

export function GroceryProductCard({
  product,
  showCountdown,
  index,
  hrefBase = '/grocery/product',
}: GroceryProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const hasCountdown = showCountdown ?? index === 0;
  const time = useCountdown(hasCountdown);

  const { openQuickView } = useUIStore();
  const { toggleItem: toggleCompare, isInCompare } = useCompareStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const img1 = product.images[0]?.src || FALLBACK_IMAGE_SRC;
  const img2 = product.images[1]?.src ?? img1;

  const badgeLabel =
    product.badge === 'sale' ? 'Sale'
    : product.badge === 'new' ? 'New'
    : product.badge === 'pre-order' ? 'Pre-order'
    : null;

  const productHref = `${hrefBase}/${product.slug}`;

  return (
    <div
      className="gfp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={productHref} className="gfp-card-img-wrap" aria-label={product.name}>
        {badgeLabel && (
          <span className={`gfp-badge gfp-badge-${product.badge}`}>{badgeLabel}</span>
        )}
        <div className="gfp-img-inner">
          <Image
            src={img1}
            alt={product.name}
            fill
            onError={handleImageError}
            style={{ objectFit: 'contain', transition: 'opacity 400ms ease', opacity: hovered ? 0 : 1 }}
            sizes="(min-width: 992px) 20vw, (min-width: 750px) 30vw, 45vw"
          />
          <Image
            src={img2}
            alt=""
            fill
            aria-hidden
            onError={handleImageError}
            style={{ objectFit: 'contain', transition: 'opacity 400ms ease', opacity: hovered ? 1 : 0 }}
            sizes="(min-width: 992px) 20vw, (min-width: 750px) 30vw, 45vw"
          />
        </div>

        {hasCountdown && (
          <div className="gfp-countdown">
            {[
              { v: time.days, l: 'Days' },
              { v: time.hrs, l: 'Hrs' },
              { v: time.min, l: 'Min' },
              { v: time.sec, l: 'Sec' },
            ].map((t) => (
              <div key={t.l} className="gfp-countdown-cell">
                <div className="gfp-countdown-v">{t.v}</div>
                <div className="gfp-countdown-l">{t.l}</div>
              </div>
            ))}
          </div>
        )}

        <div className="gfp-quick-actions">
          <div className="gfp-tooltip-wrap">
            <button
              aria-label="Wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  image: img1,
                  image2: img2,
                  slug: product.slug,
                  badge: product.badge,
                  colors: product.colors.map((c) => ({ name: c.name, value: c.value })),
                  vendor: product.vendor,
                });
              }}
              className={`gfp-action-btn ${inWishlist ? 'is-active' : ''}`}
            >
              <IconHeart size={18} />
            </button>
            <span className="gfp-tooltip">{inWishlist ? 'Already Wishlisted' : 'Wishlist'}</span>
          </div>
          {/* Compare button removed/commented out as requested:
          <div className="gfp-tooltip-wrap">
            <button
              aria-label="Compare"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(product);
              }}
              className={`gfp-action-btn ${inCompare ? 'is-active' : ''}`}
            >
              {inCompare ? <IconCheck size={18} /> : <IconCompare size={18} />}
            </button>
            <span className="gfp-tooltip">{inCompare ? 'Added' : 'Add to compare'}</span>
          </div>
          */}
          <div className="gfp-tooltip-wrap gfp-qv-wrap">
            <button
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              className="gfp-action-btn"
            >
              <IconEye size={18} />
            </button>
            <span className="gfp-tooltip">Quick view</span>
          </div>
        </div>
      </Link>

      <div className="gfp-mobile-actions">
        <button
          type="button"
          className="gfp-mob-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          aria-label={`Add ${product.name} to cart`}
        >
          <IconBag size={18} />
        </button>
        <button
          type="button"
          className="gfp-mob-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          aria-label={`Quick view ${product.name}`}
        >
          <IconEye size={18} />
        </button>
      </div>

      <div className="gfp-card-info">
        <Link href={productHref} className="gfp-card-name">{product.name}</Link>
        <div className="gfp-card-price">
          {product.compareAtPrice && (
            <span className="gfp-price-old">${product.compareAtPrice.toFixed(2)}</span>
          )}
          <span className={`gfp-price-new ${product.compareAtPrice ? 'is-sale' : ''}`}>
            ${product.price.toFixed(2)}
          </span>
        </div>
        <button
          className="gfp-quick-add"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
        >
          <IconBag size={20} />
          Quick Add
        </button>
      </div>

      <style>{`
        .gfp-card {
          position: relative;
          background-color: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          min-width: 0;
          transition: border-color 280ms ease;
        }
        .gfp-card:hover { border-color: #d8d8d8; }

        .gfp-card-img-wrap {
          display: block;
          position: relative;
          aspect-ratio: 1 / 1;
          background-color: #fff;
          overflow: hidden;
        }
        .gfp-img-inner {
          position: absolute;
          inset: 18px;
        }
        .gfp-img-inner img { transition: transform 500ms ease; }
        .gfp-card:hover .gfp-img-inner img { transform: scale(1.05); }

        .gfp-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          z-index: 3;
          letter-spacing: 0.3px;
        }
        .gfp-badge-sale { background-color: #fef1e8; color: #d4822b; }
        .gfp-badge-new  { background-color: #2c6e3a; color: #fff; }
        .gfp-badge-pre-order { background-color: #eef2ff; color: #4338ca; }

        .gfp-countdown {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 3;
          transition: opacity 300ms ease;
        }
        .gfp-card:hover .gfp-countdown { opacity: 0; pointer-events: none; }
        .gfp-countdown-cell {
          background-color: #e5f3e8;
          color: #2c6e3a;
          border-radius: 4px;
          padding: 4px 7px;
          text-align: center;
          min-width: 34px;
          line-height: 1.2;
        }
        .gfp-countdown-v { font-size: 13px; font-weight: 700; }
        .gfp-countdown-l { font-size: 9px; opacity: 0.85; }

        .gfp-quick-actions {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 3;
          opacity: 0;
          transform: translateX(10px);
          transition: opacity 300ms ease, transform 300ms ease;
          pointer-events: none;
        }
        .gfp-card:hover .gfp-quick-actions {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        .gfp-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #fff;
          border: none;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 220ms ease, color 220ms ease, transform 220ms ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .gfp-action-btn:hover {
          background-color: #1B8057;
          color: #fff;
          transform: scale(1.08);
        }
        .gfp-action-btn.is-active {
          background-color: #1B8057;
          color: #fff;
        }

        .gfp-tooltip-wrap { position: relative; }
        .gfp-tooltip {
          position: absolute;
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(6px);
          background-color: #222;
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .gfp-tooltip-wrap:hover .gfp-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .gfp-card-info {
          padding: 12px 14px 14px;
          text-align: center;
        }
        .gfp-card-name {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #222;
          margin-bottom: 6px;
          text-decoration: none;
          transition: color 200ms ease;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .gfp-card-name:hover { color: #1B8057; }

        .gfp-card-price {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .gfp-price-old {
          font-size: 12px;
          color: #aaa;
          text-decoration: line-through;
        }
        .gfp-price-new {
          font-size: 14px;
          font-weight: 700;
          color: #222;
        }
        .gfp-price-new.is-sale { color: #222; }

        .gfp-quick-add {
          width: 100%;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 500;
          color: #2c6e3a;
          background-color: #dbeadd;
          padding: 0 18px;
          border-radius: 40px;
          border: none;
          cursor: pointer;
          transition: background-color 260ms ease, color 260ms ease;
        }
        .gfp-quick-add:hover {
          background-color: #14532d;
          color: #fff;
        }

        .gfp-mobile-actions { display: none; }

        @media (max-width: 749px) {
          .gfp-mobile-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-top: 1px solid #eee;
          }
          .gfp-mob-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 48px;
            background: transparent;
            border: none;
            color: #555;
            cursor: pointer;
            transition: color 200ms ease;
          }
          .gfp-mob-btn:first-child { border-right: 1px solid #eee; }
          .gfp-mob-btn:active { color: #1B8057; }
          .gfp-quick-actions {
            opacity: 1 !important;
            transform: translateX(0) !important;
            pointer-events: auto !important;
          }
          .gfp-qv-wrap { display: none; }
          .gfp-quick-add { display: none; }
        }

        @media (min-width: 750px) {
          .gfp-card-info { padding: 14px 16px 16px; }
          .gfp-card-name { font-size: 16px; }
          .gfp-price-new { font-size: 15px; }
        }

        @media (min-width: 992px) {
          .gfp-action-btn { width: 38px; height: 38px; }
          .gfp-quick-actions { top: 22px; right: 22px; gap: 14px; }
        }
      `}</style>
    </div>
  );
}
