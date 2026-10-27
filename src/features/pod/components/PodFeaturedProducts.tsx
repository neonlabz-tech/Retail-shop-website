'use client';

import Link from 'next/link';
import { useProducts } from '@/features/products/hooks/useProducts';
import { HomeProductCard } from '@/features/home/components/HomeProductCard';

function ProductCardSkeleton() {
  return (
    <div>
      <div className="animate-shimmer aspect-[3/4] rounded-[4px] mb-[14px]" />
      <div className="animate-shimmer h-[16px] w-[70%] mx-auto mb-[8px] rounded-[4px]" />
      <div className="animate-shimmer h-[14px] w-[40%] mx-auto mb-[8px] rounded-[4px]" />
    </div>
  );
}

export function PodFeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 12, availability: 'in-stock' }, { endpoint: '/api/pod-products' });

  // Guarantee that only in-stock products appear on the homepage Featured section
  const products = (data?.products || [])
    .filter((p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0))
    .slice(0, 10);

  return (
    <section>
      <div className="container-main">
        <div className="mb-[8px] min-[750px]:mb-[14px] text-left">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">Featured Products</h2>
        </div>

        <div className="pdfp-grid">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <HomeProductCard key={product.id} product={product} index={i} />
              ))
          }
        </div>

        <div className="text-center mt-[12px] min-[750px]:mt-[20px]">
          <Link href="/shop" className="pdfp-shop-now">Shop Now</Link>
        </div>
      </div>

      <style>{`
        .pdfp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .pdfp-grid > * { min-width: 0; height: 100%; }

        @media (min-width: 750px) {
          .pdfp-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        @media (min-width: 1024px) {
          .pdfp-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }

        .pdfp-shop-now {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 24px;
          font-size: 13.5px;
          font-weight: 500;
          color: #222;
          border: 1.5px solid #222;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 250ms ease, color 250ms ease;
        }
        @media (min-width: 750px) {
          .pdfp-shop-now {
            padding: 12px 34px;
            font-size: 15px;
          }
        }
        .pdfp-shop-now:hover { background-color: #222; color: #fff; }
      `}</style>
    </section>
  );
}
