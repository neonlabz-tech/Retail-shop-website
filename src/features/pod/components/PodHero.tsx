'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';

function IconArrowLeftS({ size = 22 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" /></svg>);
}
function IconArrowRightS({ size = 22 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" /></svg>);
}

/* =========================================================================
   PREVIOUS 3-CARD HERO IMPLEMENTATION (COMMENTED OUT AS REQUESTED)
   To restore the 3-card dynamic popular products slider, re-enable this block
   and restore the activeSlides Swiper markup below.
   =========================================================================

import { useProducts } from '@/features/products/hooks/useProducts';

const ambientSlidesMeta = [
  {
    bgGradient: 'linear-gradient(150deg, #e8ebf0 0%, #dce1e9 50%, #d0d7e3 100%)',
    badge: '🔥 #1 BEST SELLER',
    tagline: 'Most loved by our customers',
  },
  {
    bgGradient: 'linear-gradient(150deg, #e5e8ed 0%, #d7dce4 50%, #cad1dd 100%)',
    badge: '⭐ TOP TRENDING',
    tagline: 'Hot selling this week',
  },
  {
    bgGradient: 'linear-gradient(150deg, #e9ecf2 0%, #dde2eb 50%, #d2d9e4 100%)',
    badge: '✨ CUSTOMER FAVORITE',
    tagline: 'Handpicked top recommendation',
  },
  {
    bgGradient: 'linear-gradient(150deg, #e3e7ee 0%, #d5dbe4 50%, #c7cfdc 100%)',
    badge: '💥 POPULAR CHOICE',
    tagline: 'Fast moving customer pick',
  },
];
========================================================================= */

// Active slim landscape banner slides
const wideBannerSlides = [
  {
    id: 'banner-home-party-essentials',
    title: 'Home & Party Essentials - Ladders, Storage Racks, Stools, Dinner Sets & More',
    image: '/pod/hero-slider/banner-home-party-essentials.png',
    href: '/products',
  },
  {
    id: 'banner-toys-games',
    title: 'Toys & Games - Fun for Every Little Adventure',
    image: '/pod/hero-slider/banner-toys-games.png',
    href: '/products?category=Toys%20%26%20Games',
  },
  {
    id: 'banner-home-kitchen',
    title: 'Home & Kitchen - Smart Essentials for Stylish Living',
    image: '/pod/hero-slider/banner-home-kitchen.png',
    href: '/products?category=Home%20%26%20Living',
  },
];

export function PodHero() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* =========================================================================
  // PREVIOUS DYNAMIC FETCH (COMMENTED OUT):
  const { data, isLoading } = useProducts({ sort: 'popular', limit: 6 });
  const rawProducts = data?.products && data.products.length > 0 ? data.products : null;
  const activeSlides = rawProducts
    ? rawProducts
        .slice(0, Math.max(4, Math.min(rawProducts.length, 6)))
        .map((p, i) => {
          const meta = ambientSlidesMeta[i % ambientSlidesMeta.length];
          const rawImg = p.images?.[0] as any;
          const imgSrc = (typeof rawImg === 'string' ? rawImg : rawImg?.src) || '';
          return {
            id: p.id || `prod-${i}`,
            name: p.name,
            slug: p.slug,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? null,
            image: imgSrc,
            badge: meta.badge,
            tagline: meta.tagline,
            bgGradient: meta.bgGradient,
          };
        })
        .filter((s) => Boolean(s.image))
    : [];
  ========================================================================= */

  return (
    <section className="pdhero-section pt-[12px] min-[750px]:pt-[20px]">
      <div className="container-main">
        <div className="pdhero-wrapper group relative">
          <Swiper
            modules={[Autoplay]}
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            slidesPerView={1}
            spaceBetween={0}
            loop={wideBannerSlides.length > 1}
            speed={700}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            className="pdhero-swiper w-full rounded-[14px] min-[750px]:rounded-[18px] overflow-hidden"
          >
            {wideBannerSlides.map((slide, i) => (
              <SwiperSlide key={slide.id}>
                <div className="pdhero-slide w-full relative overflow-hidden">
                  <Link
                    href={slide.href}
                    className="block relative w-full h-full"
                    aria-label={slide.title}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      sizes="100vw"
                      priority={i === 0}
                      unoptimized
                      className="pdhero-banner-img object-contain object-center"
                    />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows & Pagination Dots — Shown when there is more than 1 banner */}
          {wideBannerSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => swiper?.slidePrev()}
                aria-label="Previous banner"
                className="pdhero-nav pdhero-nav-prev"
              >
                <IconArrowLeftS size={24} />
              </button>
              <button
                type="button"
                onClick={() => swiper?.slideNext()}
                aria-label="Next banner"
                className="pdhero-nav pdhero-nav-next"
              >
                <IconArrowRightS size={24} />
              </button>

              <div className="pdhero-dots">
                {wideBannerSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => swiper?.slideToLoop(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`pdhero-dot ${activeIndex === i ? 'active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .pdhero-section {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .pdhero-wrapper {
          position: relative;
          width: 100%;
        }

        /* Exact aspect-ratio matching the banner dimensions perfectly with zero crop */
        .pdhero-slide {
          position: relative;
          width: 100%;
          aspect-ratio: 2609 / 602;
          height: auto;
          background-color: #ffffff;
          overflow: hidden;
        }


        /* Navigation Arrows: Hidden by default, revealed on mouse hover */
        .pdhero-nav {
          position: absolute;
          top: 50%;
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background-color: rgba(255, 255, 255, 0.92);
          color: #111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease, transform 300ms ease, background-color 200ms ease, color 200ms ease;
        }

        .pdhero-nav-prev {
          left: 18px;
          transform: translateY(-50%) translateX(-8px);
        }

        .pdhero-nav-next {
          right: 18px;
          transform: translateY(-50%) translateX(8px);
        }

        /* Reveal arrows on mouse hover */
        .pdhero-wrapper:hover .pdhero-nav {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(-50%) translateX(0);
        }

        .pdhero-nav:hover {
          background-color: #111;
          color: #fff;
          border-color: #111;
          transform: translateY(-50%) scale(1.08) !important;
        }

        /* Pagination Dots */
        .pdhero-dots {
          position: absolute;
          bottom: clamp(12px, 2.5vw, 22px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
          pointer-events: auto;
        }

        .pdhero-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background-color: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }

        .pdhero-dot:hover {
          background-color: rgba(255, 255, 255, 0.85);
        }

        .pdhero-dot.active {
          width: 26px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* Mobile Responsive — Exact aspect-ratio prevents cropping */
        @media (max-width: 749px) {
          .pdhero-slide {
            height: auto !important;
            aspect-ratio: 2609 / 602 !important;
            border-radius: 10px;
          }
          .pdhero-nav {
            display: none !important;
          }
          .pdhero-dots {
            bottom: 6px;
            gap: 5px;
          }
          .pdhero-dot {
            width: 5px;
            height: 5px;
          }
          .pdhero-dot.active {
            width: 16px;
          }
        }
      `}</style>
    </section>
  );
}
