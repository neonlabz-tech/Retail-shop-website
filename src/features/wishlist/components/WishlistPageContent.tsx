'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useCompareStore } from '@/store/compareStore';
import { formatPrice } from '@/utils/formatPrice';
import { getStorefrontOfSlug, isSameStoreScope, productHrefBaseFor, shopHrefFor, type Storefront } from '@/utils/storefront';
import type { Product } from '@/types/product';

function IconTrash({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z" />
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

function wishlistItemToProduct(item: ReturnType<typeof useWishlistStore.getState>['items'][0]): Product {
  return {
    id: item.productId,
    slug: item.slug,
    name: item.name,
    vendor: item.vendor,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    currency: 'USD',
    images: [{ id: '1', src: item.image, alt: item.name }],
    variants: [],
    colors: item.colors.map((c) => ({ name: c.name, value: c.value, type: 'hex' as const })),
    sizes: [],
    category: '',
    tags: [],
    brand: '',
    availability: 'in-stock',
    badge: item.badge as Product['badge'],
    description: '',
    features: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    relatedProducts: [],
    pairsWellWith: [],
    createdAt: '',
    sku: '',
    countdownEnd: null,
  };
}

export function WishlistPageContent({ storefront }: { storefront?: Storefront } = {}) {
  const [mounted, setMounted] = useState(false);
  const [allItems, setAllItems] = useState<ReturnType<typeof useWishlistStore.getState>['items']>([]);

  useEffect(() => {
    setMounted(true);
    useWishlistStore.getState().syncWithServer();
    setAllItems(useWishlistStore.getState().items);
    const unsub = useWishlistStore.subscribe((state) => setAllItems([...state.items]));
    return unsub;
  }, []);

  const items = storefront
    ? allItems.filter((i) => isSameStoreScope(getStorefrontOfSlug(i.slug), storefront))
    : allItems;

  const productHrefBase = productHrefBaseFor(storefront ?? 'fashion');
  const shopHref = shopHrefFor(storefront ?? 'fashion');

  const handleRemove = (id: string) => useWishlistStore.getState().removeItem(id);
  const { addItem: addToCart } = useCartStore();
  const { openQuickView } = useUIStore();
  const { toggleItem: toggleCompare } = useCompareStore();

  const handleQuickAdd = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId, variantId: `${item.productId}-default`,
      name: item.name, slug: item.slug, image: item.image,
      color: 'Default', size: 'Default', price: item.price,
      compareAtPrice: item.compareAtPrice, quantity: 1, vendor: item.vendor,
    });
  };

  const handleQuickView = (item: typeof items[0]) => openQuickView(wishlistItemToProduct(item));
  const handleCompare = (item: typeof items[0]) => toggleCompare(wishlistItemToProduct(item));

  if (!mounted) return null;

  return (
    <>
      <div className="bg-[#f7f8fc] py-[40px] text-center">
        <h1 className="text-[40px] font-semibold text-[#222]">Wishlist</h1>
      </div>

      <div className="container-main pt-[40px] pb-[80px]">
        {items.length === 0 ? (
          <div className="text-center py-[60px]">
            <h2 className="text-[28px] font-bold text-[#222] mb-[20px]">Empty Wishlist</h2>
            <Link
              href={shopHref}
              className="inline-block py-[16px] px-[36px] bg-[#000] text-[#fff] text-[18px] font-semibold no-underline transition-colors duration-[250ms] ease-in-out"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F15B41'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000'; }}
            >
              Continue Browsing
            </Link>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map((item, i) => (
              <WishlistCard key={item.productId} item={item} index={i} onRemove={handleRemove} onQuickAdd={handleQuickAdd} onQuickView={handleQuickView} onCompare={handleCompare} productHrefBase={productHrefBase} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        
        .wl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

        
        .wl-mobile-btns { display: none; width: 100%; }
        .wl-mobile-btn-bag,
        .wl-mobile-btn-eye {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 13px 0;
          border: none;
          cursor: pointer;
          background-color: #fff;
          color: #222;
          transition: background-color 200ms ease;
        }
        .wl-mobile-btn-bag:hover,
        .wl-mobile-btn-eye:hover { background-color: #f5f5f5; }

        
        @media (max-width: 991px) {
          .wl-grid { grid-template-columns: 1fr; }

          .wl-img-link {
            height: 650px !important;
            aspect-ratio: unset !important;
            margin-bottom: 0 !important;
          }

          .wl-actions-overlay {
            opacity: 1 !important;
            transform: translateX(0) !important;
          }

          .wl-eye-btn { display: none; }

          .wl-quick-add-overlay { display: none !important; }

          .wl-mobile-btns { display: flex; margin-bottom: 14px; }
        }

        
        @media (max-width: 749px) {
          .wl-img-link { height: clamp(290px, 86vw, 650px) !important; }
        }
      `}</style>
    </>
  );
}

function WishlistCard({ item, index, onRemove, onQuickAdd, onQuickView, onCompare, productHrefBase }: {
  item: ReturnType<typeof useWishlistStore.getState>['items'][0];
  index: number;
  onRemove: (id: string) => void;
  onQuickAdd: (item: ReturnType<typeof useWishlistStore.getState>['items'][0]) => void;
  onQuickView: (item: ReturnType<typeof useWishlistStore.getState>['items'][0]) => void;
  onCompare: (item: ReturnType<typeof useWishlistStore.getState>['items'][0]) => void;
  productHrefBase: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="wl-card relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`${productHrefBase}/${item.slug}`}
        className="wl-img-link block relative aspect-[3/4] overflow-hidden bg-[#f5f5f5] rounded-[4px] mb-[14px]"
      >
        <Image src={item.image} alt={item.name} fill className={`object-cover transition-opacity duration-[500ms] ease-in-out ${hovered ? 'opacity-0' : 'opacity-100'}`} sizes="(max-width: 749px) 100vw, 25vw" />
        <Image src={item.image2 || item.image} alt={`${item.name} hover`} fill className={`object-cover transition-opacity duration-[500ms] ease-in-out ${hovered ? 'opacity-100' : 'opacity-0'}`} sizes="(max-width: 749px) 100vw, 25vw" />

        {item.badge && (
          <span className={`absolute top-[12px] left-[12px] text-[#fff] text-[12px] font-semibold py-[4px] px-[12px] rounded-[3px] z-[3] capitalize ${item.badge === 'sale' ? 'bg-[#F15B41]' : 'bg-[#222]'}`}>
            {item.badge}
          </span>
        )}

        <div
          className={`wl-actions-overlay absolute top-[12px] right-[12px] flex flex-col gap-[8px] z-[3] transition-[opacity,transform] duration-[300ms] ease-in-out ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[10px]'}`}
        >
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.productId); }} className="fc-action-btn fc-action-btn-light" aria-label="Remove">
            <IconTrash size={18} />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(item); }} className="fc-action-btn fc-action-btn-dark wl-eye-btn" aria-label="Quick view">
            <IconEye size={18} />
          </button>
        </div>

        <div
          className={`wl-quick-add-overlay absolute bottom-[14px] left-[16px] right-[16px] z-[4] transition-[opacity,transform] duration-[300ms] ease-in-out ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[16px]'}`}
        >
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAdd(item); }} className="fc-quick-add-btn">
            <IconBag size={18} /> Quick Add
          </button>
        </div>
      </Link>

      <div className="wl-mobile-btns">
        <button
          className="wl-mobile-btn-bag"
          aria-label="Quick add"
          onClick={() => onQuickAdd(item)}
        >
          <IconBag size={18} />
        </button>
        <button
          className="wl-mobile-btn-eye"
          aria-label="Quick view"
          onClick={() => onQuickView(item)}
        >
          <IconEye size={18} />
        </button>
      </div>

      <div className="text-center">
        <Link href={`${productHrefBase}/${item.slug}`} className="text-[15px] font-medium text-[#222] no-underline transition-colors duration-[150ms] ease-in-out"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}
        >
          {item.name}
        </Link>
        {(() => {
          const wlDiscount = item.compareAtPrice && item.compareAtPrice > item.price
            ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
            : 0;
          return (
            <div className="mt-[6px] flex items-baseline justify-center gap-[6px] flex-wrap">
              <span className="product-price-text text-[15px] font-bold text-[#222]">
                {formatPrice(item.price)}
              </span>
              {wlDiscount > 0 && (
                <span className="text-[#F15B41] bg-[#fff0ed] text-[11px] font-bold px-[4px] py-[1px] rounded-[3px] leading-none">
                  -{wlDiscount}%
                </span>
              )}
              {item.compareAtPrice && (
                <span className="text-[13px] text-[#999] line-through font-normal">
                  {formatPrice(item.compareAtPrice)}
                </span>
              )}
            </div>
          );
        })()}
        {item.colors.length > 0 && (
          <div className="mt-[8px] flex items-center justify-center gap-[6px]">
            {item.colors.slice(0, 3).map((c) => (
              <span key={c.name} className={`w-[16px] h-[16px] rounded-full inline-block border ${c.value === '#FFFFFF' ? 'border-[#ddd]' : 'border-transparent'}`} style={{ backgroundColor: c.value }} />
            ))}
            {item.colors.length > 3 && <span className="text-[13px] text-[#F15B41] font-medium">+{item.colors.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
