'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useProducts } from '@/features/products/hooks/useProducts';
import { HomeProductCard } from './HomeProductCard';

import 'swiper/css';

function IconArrowLeftS({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
    </svg>
  );
}

function IconArrowRightS({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
    </svg>
  );
}

export interface FeaturedCardTheme {
  showCountdown?: boolean;
  showScrollText?: boolean;
  imageHeight?: string;
  themeColor?: string;
  countdownBg?: string;
  compact?: boolean;
}

interface FeaturedSliderProps {
  apiEndpoint?: string;
  cardVariant?: 'home' | 'grocery';
  productHrefBase?: string;
  cardTheme?: FeaturedCardTheme;
  title?: string;
  count?: number;
}

export function FeaturedSlider({ apiEndpoint, cardVariant = 'home', productHrefBase, cardTheme, title = 'Featured Collection', count }: FeaturedSliderProps = {}) {
  const { data } = useProducts({ limit: 30 }, apiEndpoint ? { endpoint: apiEndpoint } : undefined);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const all = data?.products ?? [];
  const tail = all.slice(15, 27);
  const basePool = tail.length >= 8 ? tail : all.slice(0, 12);
  const products = count ? basePool.slice(0, count) : basePool;

  return (
    <section className="fs-section">
      <div className="container-main">
        <div className="mb-[16px] min-[750px]:mb-[24px] text-left">
          <h2 className="text-[clamp(22px,3vw,28px)] font-semibold text-[#222]">{title}</h2>
        </div>

        <div style={{ position: 'relative' }}>
          {products.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              onSwiper={setSwiperInstance}
              slidesPerView={2}
              breakpoints={{
                750: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
              }}
              spaceBetween={24}
              loop
              speed={600}
              style={{ overflow: 'hidden' }}
            >
              {products.map((product, i) => (
                <SwiperSlide key={product.id}>
                  <HomeProductCard
                    product={product}
                    index={i + 15}
                    hrefBase={productHrefBase}
                    {...cardTheme}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="animate-shimmer" style={{ aspectRatio: '3/4', borderRadius: '4px', marginBottom: '14px' }} />
                  <div className="animate-shimmer" style={{ height: '16px', width: '70%', margin: '0 auto 8px', borderRadius: '4px' }} />
                  <div className="animate-shimmer" style={{ height: '14px', width: '40%', margin: '0 auto', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          )}

          <button onClick={() => swiperInstance?.slidePrev()} aria-label="Previous" className="fs-nav-prev">
            <IconArrowLeftS size={20} />
          </button>
          <button onClick={() => swiperInstance?.slideNext()} aria-label="Next" className="fs-nav-next">
            <IconArrowRightS size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .fs-nav-prev,
        .fs-nav-next {
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
        .fs-nav-prev { left: 8px; transform: translateY(-50%); }
        .fs-nav-next { right: 8px; transform: translateY(-50%); }

        .fs-section:hover .fs-nav-prev { opacity: 1; }
        .fs-section:hover .fs-nav-next { opacity: 1; }

        .fs-nav-prev:hover,
        .fs-nav-next:hover { background-color: #000; border-color: #000; color: #fff; }

        @media (min-width: 992px) and (max-width: 1199px) {
          .fs-section .fc-card > a:first-child {
            height: clamp(300px, 28vw, 360px);
            aspect-ratio: auto;
          }
        }

        
        @media (max-width: 749px) {
          .fs-nav-prev,
          .fs-nav-next { display: none !important; }
        }
      `}</style>
    </section>
  );
}
