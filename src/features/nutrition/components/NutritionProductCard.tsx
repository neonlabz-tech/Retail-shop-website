'use client';

import { useState } from 'react';
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

interface NutritionProductCardProps {
  product: Product;
  hrefBase?: string;
  imageHeight?: string;
}

export function NutritionProductCard({
  product,
  hrefBase = '/nutrition/product',
  imageHeight = '340px',
}: NutritionProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const { openQuickView } = useUIStore();
  const { toggleItem: toggleCompare, isInCompare } = useCompareStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const inCompare = isInCompare(product.id);
  const inWishlist = isInWishlist(product.id);
  const defaultImg1 = product.images[0]?.src || FALLBACK_IMAGE_SRC;
  const defaultImg2 = product.images[1]?.src || defaultImg1;
  const productHref = `${hrefBase}/${product.slug}`;

  const colorImages = product.colors.reduce<Record<string, string>>((acc, c) => {
    const variant = product.variants.find(v => v.color === c.name);
    if (variant) acc[c.name] = variant.image;
    return acc;
  }, {});

  return (
    <div
      className="npc-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredColor(null); }}
    >
      <Link href={productHref} className="npc-image" style={{ height: imageHeight }}>
        <Image src={defaultImg1} alt={product.name} fill onError={handleImageError} style={{ objectFit: 'cover', transition: 'opacity 400ms ease', opacity: (hovered && !hoveredColor) ? 0 : 1 }} sizes="(max-width: 749px) 50vw, 25vw" />
        <Image src={defaultImg2} alt={`${product.name} hover`} fill onError={handleImageError} style={{ objectFit: 'cover', transition: 'opacity 400ms ease', opacity: hovered && !hoveredColor ? 1 : 0 }} sizes="(max-width: 749px) 50vw, 25vw" />
        {Object.entries(colorImages).map(([colorName, imgSrc]) => (
          <Image key={colorName} src={imgSrc} alt={`${product.name} ${colorName}`} fill style={{ objectFit: 'cover', transition: 'opacity 150ms ease', opacity: hoveredColor === colorName ? 1 : 0, zIndex: hoveredColor === colorName ? 2 : 1 }} sizes="(max-width: 749px) 50vw, 25vw" />
        ))}

        {product.badge && (
          <span className="npc-badge" data-badge={product.badge}>{product.badge}</span>
        )}

        <div className="npc-actions" style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(10px)' }}>
          <div className="npc-tooltip-wrap">
            <button aria-label="Wishlist" className={`npc-action-btn ${inWishlist ? 'is-on' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ productId: product.id, name: product.name, price: product.price, compareAtPrice: product.compareAtPrice, image: defaultImg1, image2: defaultImg2, slug: product.slug, badge: product.badge, colors: product.colors.map(c => ({ name: c.name, value: c.value })), vendor: product.vendor }); }}>
              <IconHeart size={18} />
            </button>
            <span className="npc-tooltip">{inWishlist ? 'Wishlisted' : 'Wishlist'}</span>
          </div>
          {/* Compare button removed/commented out as requested:
          <div className="npc-tooltip-wrap">
            <button aria-label="Compare" className={`npc-action-btn ${inCompare ? 'is-on' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product); }}>
              <IconCompare size={18} />
            </button>
            <span className="npc-tooltip">{inCompare ? 'Added' : 'Compare'}</span>
          </div>
          */}
          <div className="npc-tooltip-wrap npc-qv-wrap">
            <button aria-label="Quick view" className="npc-action-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}>
              <IconEye size={18} />
            </button>
            <span className="npc-tooltip">Quick view</span>
          </div>
        </div>
      </Link>

      <div className="npc-mobile-actions">
        <button
          type="button"
          className="npc-mob-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          aria-label={`Add ${product.name} to cart`}
        >
          <IconBag size={18} />
        </button>
        <button
          type="button"
          className="npc-mob-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          aria-label={`Quick view ${product.name}`}
        >
          <IconEye size={18} />
        </button>
      </div>

      <div className="npc-content">
        <Link href={productHref} className="npc-name">{product.name}</Link>
        <div className="npc-price-row">
          {product.compareAtPrice && (
            <span className="npc-compare">{formatPrice(product.compareAtPrice)}</span>
          )}
          <span className="npc-price">{formatPrice(product.price)}</span>
        </div>
        {product.colors.length > 0 && (
          <div className="npc-swatches">
            {product.colors.slice(0, 3).map((c) => (
              <span
                key={c.name}
                onMouseEnter={() => setHoveredColor(c.name)}
                onMouseLeave={() => setHoveredColor(null)}
                className="npc-swatch"
                style={{
                  backgroundColor: c.value,
                  borderColor: hoveredColor === c.name ? '#222' : (c.value === '#FFFFFF' ? '#ddd' : 'transparent'),
                  transform: hoveredColor === c.name ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="npc-swatch-more">+{product.colors.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="npc-quick-add"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
      >
        <IconBag size={17} /> Quick Add
      </button>

      <style>{`
        .npc-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          border: 1px solid #ececec;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
          height: 520px;
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }
        .npc-card:hover {
          border-color: #d6d6d6;
          box-shadow: 0 6px 18px rgba(0,0,0,0.05);
        }
        .npc-image {
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: 6px;
          background: #f5f5f5;
        }
        .npc-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #F15B41;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 3px;
          text-transform: capitalize;
          z-index: 3;
        }
        .npc-badge[data-badge="new"] { background: #222; }

        .npc-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 3;
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .npc-tooltip-wrap { position: relative; }
        .npc-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #fff;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background-color 200ms ease, color 200ms ease, transform 200ms ease;
        }
        .npc-action-btn:hover {
          background: rgb(140, 255, 100);
          color: #0e1a0a;
          transform: scale(1.08);
        }
        .npc-action-btn.is-on {
          background: rgb(140, 255, 100);
          color: #0e1a0a;
        }
        .npc-tooltip {
          position: absolute;
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(6px);
          background: #222;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .npc-tooltip-wrap:hover .npc-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .npc-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 6px;
          padding: 0 4px 16px;
          flex: 1;
          min-height: 0;
        }
        .npc-name {
          font-size: 14px;
          font-weight: 600;
          color: #1d4f45;
          text-decoration: none;
          transition: color 200ms ease;
          letter-spacing: 0.1px;
        }
        .npc-name:hover { color: rgb(140, 255, 100); }
        .npc-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .npc-compare {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
        }
        .npc-price {
          font-size: 14px;
          font-weight: 600;
          color: #1d4f45;
        }
        .npc-swatches {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .npc-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid transparent;
          display: inline-block;
          cursor: pointer;
          transition: border-color 200ms ease, transform 200ms ease;
          border-width: 1px;
          border-style: solid;
        }
        .npc-swatch-more {
          font-size: 13px;
          color: #F15B41;
          font-weight: 500;
        }

        .npc-quick-add {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #DFF5C8;
          color: #1d4f45;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 15px 0;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .npc-quick-add:hover {
          background: #7EE05A;
          color: #1d4f45;
        }

        .npc-mobile-actions { display: none; }

        @media (max-width: 749px) {
          .npc-card { height: auto; }
          .npc-image { height: 180px !important; }
          .npc-tooltip {
            font-size: 9px;
            padding: 4px 8px;
            right: calc(100% + 5px);
            white-space: nowrap;
          }
          .npc-actions {
            opacity: 1 !important;
            transform: translateX(0) !important;
            pointer-events: auto !important;
          }
          .npc-qv-wrap { display: none; }
          .npc-quick-add { display: none; }
          .npc-mobile-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-top: 1px solid #eee;
          }
          .npc-mob-btn {
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
          .npc-mob-btn:first-child { border-right: 1px solid #eee; }
          .npc-mob-btn:active { color: rgb(140, 255, 100); }
        }

        @media (max-width: 549px) {
          .npc-image { height: clamp(130px, 36vw, 170px) !important; }
        }
      `}</style>
    </div>
  );
}
