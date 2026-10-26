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

export function PodRandomRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRandomProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recommendations/random?limit=10&inStock=true', { cache: 'no-store' });
      if (!res.ok) {
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
        const inStockOnly = data.products.filter(
          (p: Product) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0)
        );
        setProducts(inStockOnly.slice(0, 5));
      }
    } catch (err) {
      console.warn('Could not load random recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="pod-random-recommendations-section">
      <div className="container-main">
        <div className="flex flex-col items-start mb-[8px] min-[750px]:mb-[14px] text-left">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">
            Recommended For You
          </h2>
        </div>

        <div className="pod-random-grid">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <HomeProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        <div className="text-center mt-[40px] flex justify-center gap-[16px]">
          <Link
            href="/products"
            className="py-[11px] px-[26px] text-[14px] font-semibold text-[#fff] bg-[#222] border-[1.5px] border-solid border-[#222] rounded-[4px] no-underline inline-flex items-center transition-all duration-200 ease-in-out"
          >
            Explore All Products
          </Link>
        </div>
      </div>

      <style>{`
        .pod-random-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .pod-random-grid > * { min-width: 0; height: 100%; }

        @media (min-width: 750px) {
          .pod-random-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        @media (min-width: 1024px) {
          .pod-random-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }

        .pod-refresh-btn:hover {
          background-color: #F15B41 !important;
          color: #fff !important;
        }
      `}</style>
    </section>
  );
}

export default PodRandomRecommendations;
