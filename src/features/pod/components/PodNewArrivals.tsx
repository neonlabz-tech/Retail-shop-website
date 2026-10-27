'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useProducts } from '@/features/products/hooks/useProducts';
import { HomeProductCard } from '@/features/home/components/HomeProductCard';

import 'swiper/css';

function IconArrowLeftS({ size = 20 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" /></svg>);
}
function IconArrowRightS({ size = 20 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" /></svg>);
}

function ProductCardSkeleton() {
  return (
    <div>
      <div className="animate-shimmer aspect-[3/4] rounded-[4px] mb-[14px]" />
      <div className="animate-shimmer h-[16px] w-[70%] mx-auto mb-[8px] rounded-[4px]" />
      <div className="animate-shimmer h-[14px] w-[40%] mx-auto mb-[8px] rounded-[4px]" />
    </div>
  );
}

export function PodNewArrivals() {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const { data, isLoading } = useProducts(
    { limit: 12, page: 2, availability: 'in-stock' },
    { endpoint: '/api/pod-products' }
  );

  const { data: page1Data } = useProducts(
    { limit: 12, page: 1, availability: 'in-stock' },
    { endpoint: '/api/pod-products' }
  );

  // Guarantee that only in-stock products appear on the homepage New Arrivals slider
  const page2InStock = (data?.products || []).filter(
    (p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0)
  );
  const page1InStock = (page1Data?.products || []).filter(
    (p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0)
  );

  const products = (page2InStock.length >= 5 ? page2InStock : page1InStock).slice(0, 10);

  return (
    <section className="pdna-section">
      <div className="container-main">
        <div className="flex items-center justify-between mb-[8px] min-[750px]:mb-[14px]">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">New Arrivals</h2>
          <Link
            href="/shop?sort=newest"
            className="text-[13px] min-[750px]:text-[14px] font-medium text-[#222] underline underline-offset-[3px] whitespace-nowrap"
          >
            View All →
          </Link>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="pdna-grid">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              onSwiper={setSwiperInstance}
              slidesPerView={2}
              breakpoints={{
                750: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
              spaceBetween={16}
              loop
              speed={600}
              className="overflow-hidden"
            >
              {products.map((product, i) => (
                <SwiperSlide key={product.id}>
                  <HomeProductCard product={product} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <button onClick={() => swiperInstance?.slidePrev()} aria-label="Previous" className="pdna-nav-prev">
            <IconArrowLeftS size={20} />
          </button>
          <button onClick={() => swiperInstance?.slideNext()} aria-label="Next" className="pdna-nav-next">
            <IconArrowRightS size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .pdna-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .pdna-grid > * { min-width: 0; height: 100%; }
        @media (min-width: 750px) {
          .pdna-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .pdna-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }

        .pdna-section .swiper-slide {
          height: auto !important;
          display: flex !important;
        }
        .pdna-section .swiper-slide > * {
          width: 100% !important;
          height: 100% !important;
        }

        .pdna-nav-prev, .pdna-nav-next {
          position: absolute;
          top: 40%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #e0e0e0;
          background-color: #fff;
          color: #222;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 400ms ease, transform 400ms ease, background-color 250ms ease, border-color 250ms ease, color 250ms ease;
        }
        .pdna-nav-prev { left: -8px; }
        .pdna-nav-next { right: -8px; }
        .pdna-section:hover .pdna-nav-prev,
        .pdna-section:hover .pdna-nav-next { opacity: 1; }
        .pdna-nav-prev:hover, .pdna-nav-next:hover { background-color: #000; border-color: #000; color: #fff; }

        @media (max-width: 749px) {
          .pdna-nav-prev, .pdna-nav-next { display: none; }
        }
      `}</style>
    </section>
  );
}
