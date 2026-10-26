'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeProductCard } from '@/features/home/components/HomeProductCard';
import type { Product } from '@/types/product';

function ProductCardSkeleton() {
  return (
    <div>
      <div className="animate-shimmer aspect-[3/4] rounded-[4px] mb-[14px]" />
      <div className="animate-shimmer h-[16px] w-[70%] mx-auto mb-[8px] rounded-[4px]" />
      <div className="animate-shimmer h-[14px] w-[40%] mx-auto mb-[8px] rounded-[4px]" />
    </div>
  );
}

export function PodRecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecentlyViewed() {
      try {
        const res = await fetch(`/api/recommendations/recently-viewed?limit=10&inStock=true&_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (isMounted) setIsLoading(false);
          return;
        }
        const data = await res.json();
        let list: Product[] = (data?.success && Array.isArray(data.products) ? data.products : [])
          .filter((p: Product) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0));

        // Safety guarantee: If fewer than 5 products, top up from recommendations so the 5-column row is always full
        if (list.length < 5) {
          try {
            const randRes = await fetch(`/api/recommendations/random?limit=10&inStock=true&_t=${Date.now()}`, {
              cache: 'no-store',
            });
            if (randRes.ok) {
              const randData = await randRes.json();
              if (randData?.success && Array.isArray(randData.products)) {
                const existingIds = new Set(list.map((p) => p.id));
                const extras = randData.products
                  .filter((p: Product) => !existingIds.has(p.id))
                  .filter((p: Product) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0));
                list = [...list, ...extras].slice(0, 5);
              }
            }
          } catch {
            // ignore fallback error
          }
        }

        if (isMounted && list.length > 0) {
          setProducts(list);
        }
      } catch (err) {
        console.warn('Could not fetch recently viewed products:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecentlyViewed();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="pod-recently-viewed-section">
      <div className="container-main">
        <div className="mb-[8px] min-[750px]:mb-[14px] text-left">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">
            Recently Viewed Products
          </h2>
        </div>

        <div className="pod-rv-grid">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.slice(0, 5).map((product, i) => (
                <HomeProductCard key={product.id} product={product} index={i} />
              ))}
        </div>
      </div>

      <style>{`
        .pod-rv-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .pod-rv-grid > * { min-width: 0; height: 100%; }

        @media (min-width: 750px) {
          .pod-rv-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        @media (min-width: 1024px) {
          .pod-rv-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }
      `}</style>
    </section>
  );
}

export default PodRecentlyViewed;
