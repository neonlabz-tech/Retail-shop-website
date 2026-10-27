'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { PodTopCategoriesSkeleton } from './PodTopCategoriesSkeleton';

import 'swiper/css';

function IconArrowLeftS({ size = 20 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" /></svg>);
}
function IconArrowRightS({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" /></svg>);
}

interface CategoryItem {
  id: string;
  label: string;
  image: string;
  href: string;
}

export function PodTopCategories() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetch('/api/categories')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const liveCats: CategoryItem[] = data.categories.map((c: any) => {
            return {
              id: c.id,
              label: c.name,
              image: (c.image && typeof c.image === 'string' && c.image.trim() !== '')
                ? c.image
                : '/placeholder.svg',
              href: `/shop?category=${encodeURIComponent(c.name)}`,
            };
          });
          const padded = liveCats.length < 6 ? [...liveCats, ...liveCats] : liveCats;
          setCategoryItems(padded);
        }
      })
      .catch((err) => console.error('Error fetching live categories from MongoDB:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <PodTopCategoriesSkeleton />;
  }

  if (categoryItems.length === 0) {
    return null;
  }

  return (
    <section className="pdcat-section">
      <div className="container-main">
        <div className="flex items-center justify-between gap-[12px] mb-[8px] min-[750px]:mb-[14px]">
          <h2 className="text-[17px] min-[750px]:text-[28px] font-semibold text-[#222]">Shop by categories</h2>
          <Link
            href="/collections"
            className="inline-flex items-center gap-[4px] min-[750px]:gap-[6px] text-[13px] min-[750px]:text-[16px] font-medium text-[#222] underline underline-offset-[3px] whitespace-nowrap shrink-0"
          >
            View All Categories
            <IconArrowRightS size={16} className="w-[16px] h-[16px] min-[750px]:w-[22px] min-[750px]:h-[22px]" />
          </Link>
        </div>

        <div className="pdcat-slider-outer">
          <div className="overflow-hidden py-[4px] px-[6px]">
            <Swiper
              modules={[Navigation]}
              onSwiper={(s) => { swiperRef.current = s; }}
              slidesPerView={3}
              breakpoints={{
                480: { slidesPerView: 3, spaceBetween: 14 },
                750: { slidesPerView: 4, spaceBetween: 18 },
                992: { slidesPerView: 5, spaceBetween: 20 },
                1200: { slidesPerView: 5, spaceBetween: 24 },
              }}
              spaceBetween={10}
              loop
              speed={600}
              className="!overflow-visible"
            >
              {categoryItems.map((cat, idx) => (
                <SwiperSlide key={`${cat.id}-${idx}`}>
                  <Link href={cat.href} className="pd-cat-item">
                    <div className="pd-cat-circle bg-[#ebf0f5]" style={{ backgroundColor: "#ebf0f5" }}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt=""
                          className="pd-cat-img"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <span className="pd-cat-fallback-icon">📁</span>
                      )}
                    </div>
                    <span className="pd-cat-label">{cat.label}</span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous" className="pdcat-nav pdcat-nav-prev hidden min-[750px]:flex">
            <IconArrowLeftS size={20} />
          </button>
          <button onClick={() => swiperRef.current?.slideNext()} aria-label="Next" className="pdcat-nav pdcat-nav-next hidden min-[750px]:flex">
            <IconArrowRightS size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .pd-cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          gap: 6px;
          width: 100%;
        }
        @media (min-width: 750px) {
          .pd-cat-item {
            gap: 10px;
          }
        }
        .pd-cat-circle {
          position: relative;
          width: 100%;
          max-width: 220px;
          aspect-ratio: 1 / 1;
          height: auto;
          border-radius: 50%;
          overflow: hidden;
          isolation: isolate;
          background-color: #ebf0f5;
          border: none;
          box-shadow: 0 8px 16px -2px rgba(24, 62, 132, 0.12), 4px 6px 10px -2px rgba(24, 62, 132, 0.04), -4px 6px 10px -2px rgba(24, 62, 132, 0.04);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          transition: transform 300ms ease, box-shadow 300ms ease, background-color 300ms ease;
        }
        .pd-cat-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 400ms ease;
          display: block;
          mix-blend-mode: multiply;
        }
        .pd-cat-item:hover .pd-cat-img { transform: scale(1.08); }
        .pd-cat-item:hover .pd-cat-circle {
          background-color: #e2e8f0;
          box-shadow: 0 10px 20px -2px rgba(24, 62, 132, 0.18), 4px 6px 12px -2px rgba(24, 62, 132, 0.06), -4px 6px 12px -2px rgba(24, 62, 132, 0.06);
          transform: translateY(-2px);
        }
        .pd-cat-fallback-icon {
          font-size: 38px;
        }
        .pd-cat-label {
          font-size: clamp(13px, 1.2vw, 15px);
          font-weight: 500;
          color: #222;
          transition: color 200ms ease;
        }
        .pd-cat-item:hover .pd-cat-label {
          color: #183e84;
        }

        /* ── Slider outer ── */
        .pdcat-slider-outer {
          position: relative;
        }
        .pdcat-nav {
          position: absolute;
          top: 42%;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background-color 250ms ease, border-color 250ms ease, color 250ms ease, box-shadow 250ms ease;
        }
        .pdcat-nav-prev { left: -22px; }
        .pdcat-nav-next { right: -22px; }
        .pdcat-nav:hover {
          background-color: #111;
          border-color: #111;
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        @media (max-width: 749px) {
          .pd-cat-item { gap: 8px; }
          .pd-cat-circle { padding: 10px; }
          .pd-cat-label { font-size: 11.5px; line-height: 1.25; }
          .pdcat-nav { display: none !important; }



        }
      `}</style>
    </section>
  );
}
