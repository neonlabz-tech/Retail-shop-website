'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useSearch } from '@/features/products/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/utils/formatPrice';
import { POPULAR_SEARCHES, GROCERY_POPULAR_SEARCHES, PET_FOOD_POPULAR_SEARCHES, MEGASTORE_POPULAR_SEARCHES, PIZZA_POPULAR_SEARCHES, PLANT_GARDEN_POPULAR_SEARCHES, SKIN_CARE_POPULAR_SEARCHES, JEWELLERY_POPULAR_SEARCHES, PHONE_CASE_POPULAR_SEARCHES, SMART_WATCHES_POPULAR_SEARCHES, FOOTWEAR_POPULAR_SEARCHES } from '@/lib/constants';
import { getStorefrontFromPath, productHrefBaseFor, shopHrefFor } from '@/utils/storefront';
import { FALLBACK_IMAGE_SRC, handleImageError, normalizeImageSrc } from '@/lib/imageFallback';

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

function IconClose({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
    </svg>
  );
}

export function SearchDrawer() {
  const { searchOpen, closeSearch } = useUIStore();
  const pathname = usePathname();
  const storefront = getStorefrontFromPath(pathname);
  const searchEndpoint = '/api/pod-search';
  const productHrefBase = '/products';
  const shopHref = '/shop';
  const popularTerms = POPULAR_SEARCHES;
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useSearch(debouncedQuery, { endpoint: searchEndpoint });

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [searchOpen, closeSearch]);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div
        onClick={closeSearch}
        className={`fixed inset-0 bg-black/40 z-[9999] transition-opacity duration-250 ease-in-out ${
          searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 w-[420px] max-w-[100vw] bg-white z-[9999] flex flex-col transition-transform duration-350 ease-in-out ${
          searchOpen
            ? 'translate-x-0 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]'
            : 'translate-x-full shadow-none'
        }`}
      >
        <div className="pt-[24px] px-[24px] pb-0">
          <div className="flex items-center gap-[12px] pb-[14px] border-b-[1.5px] border-[#222]">
            <IconSearch size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for..."
              autoFocus={searchOpen}
              className="flex-1 text-[18px] text-[#222] border-none outline-none bg-transparent"
            />
            {hasQuery && (
              <button
                onClick={() => setQuery('')}
                className="w-[20px] h-[20px] rounded-full bg-[#e0e0e0] border-none cursor-pointer flex items-center justify-center text-[12px] text-[#666] leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
            <button
              onClick={closeSearch}
              className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#222]"
              aria-label="Close search"
            >
              <IconClose size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[24px] py-0">

          {!hasQuery && (
            <>
              {popularTerms && popularTerms.length > 0 && (
                <div className="pt-[24px] mb-[24px]">
                  <h4 className="text-[20px] font-bold text-[#222] mb-[14px]">
                    Popular searches:
                  </h4>
                  <div className="flex flex-wrap gap-[12px]">
                    {popularTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-[16px] text-[#555] bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 ease-in-out hover:text-[#F15B41]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-[24px] font-bold text-[#222] mb-[16px]">
                Most searched products:
              </h4>

              <div>
                {data?.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`${productHrefBase}/${product.slug}`}
                    onClick={closeSearch}
                    className="search-product-item flex items-center gap-[16px] py-[14px] px-0 border-b border-[#f0f0f0] no-underline text-inherit"
                  >
                    <div className="w-[60px] h-[70px] rounded-[4px] overflow-hidden bg-[#f5f5f5] shrink-0 relative">
                      <Image
                        src={normalizeImageSrc(product.images[0]?.src) || FALLBACK_IMAGE_SRC}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="60px"
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-[#222] mb-[5px]">
                        {product.name}
                      </p>
                      {(() => {
                        const sDiscount = product.compareAtPrice && product.compareAtPrice > product.price
                          ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                          : 0;
                        return (
                          <div className="flex items-baseline gap-[6px] flex-wrap">
                            <span className="product-price-text text-[15px] font-bold text-[#e01117]">
                              {formatPrice(product.price)}
                            </span>
                            {sDiscount > 0 && (
                              <span className="text-[#F15B41] bg-[#fff0ed] text-[11px] font-bold px-[4px] py-[1px] rounded-[3px] leading-none">
                                -{sDiscount}%
                              </span>
                            )}
                            {product.compareAtPrice && (
                              <span className="text-[13px] text-[#999] line-through font-normal">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {hasQuery && (
            <>
              {data?.suggestions && data.suggestions.length > 0 && (
                <div className="pt-[20px] mb-[8px]">
                  <div className="pb-[10px] border-b border-[#e5e5e5] mb-[12px]">
                    <span className="text-[12px] font-bold text-[#888] tracking-[2px] uppercase">
                      SUGGESTIONS
                    </span>
                  </div>
                  {data.suggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="block w-full text-left text-[16px] text-[#222] py-[10px] px-0 bg-transparent border-none cursor-pointer transition-[color] duration-200 ease-in-out"
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="pb-[10px] border-b border-[#e5e5e5] mb-[12px]">
                <span className="text-[12px] font-bold text-[#888] tracking-[2px] uppercase">
                  PRODUCTS
                </span>
              </div>

              <div>
                {data?.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`${productHrefBase}/${product.slug}`}
                    onClick={closeSearch}
                    className="search-product-item flex items-center gap-[16px] py-[14px] px-0 border-b border-[#f0f0f0] no-underline text-inherit"
                  >
                    <div className="w-[60px] h-[70px] rounded-[4px] overflow-hidden bg-[#f5f5f5] shrink-0 relative">
                      <Image
                        src={normalizeImageSrc(product.images[0]?.src) || FALLBACK_IMAGE_SRC}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="60px"
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#888] tracking-[1.5px] uppercase mb-[4px]">
                        {product.vendor}
                      </p>
                      <p className="text-[16px] font-semibold text-[#222] mb-[5px]">
                        {product.name}
                      </p>
                      {(() => {
                        const sDiscount = product.compareAtPrice && product.compareAtPrice > product.price
                          ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                          : 0;
                        return (
                          <div className="flex items-baseline gap-[6px] flex-wrap">
                            <span className="product-price-text text-[15px] font-bold text-[#e01117]">
                              {formatPrice(product.price)}
                            </span>
                            {sDiscount > 0 && (
                              <span className="text-[#F15B41] bg-[#fff0ed] text-[11px] font-bold px-[4px] py-[1px] rounded-[3px] leading-none">
                                -{sDiscount}%
                              </span>
                            )}
                            {product.compareAtPrice && (
                              <span className="text-[13px] text-[#999] line-through font-normal">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {hasQuery && (
          <div className="flex items-center justify-between py-[16px] px-[24px] border-t border-[#e5e5e5]">
            <Link
              href={`${shopHref}?q=${encodeURIComponent(query)}`}
              onClick={closeSearch}
              className="text-[14px] text-[#F15B41] underline font-medium"
            >
              Search for &quot;{query}&quot;
            </Link>
            <Link
              href={`${shopHref}?q=${encodeURIComponent(query)}`}
              onClick={closeSearch}
              className="text-[#222] flex"
            >
              <IconArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .search-product-item:hover {
          background-color: #fafafa;
        }
      `}</style>
    </>
  );
}
