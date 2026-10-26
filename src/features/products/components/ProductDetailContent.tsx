'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCompareStore } from '@/store/compareStore';
import { useAuthStore, checkAuthOrRedirect } from '@/store/authStore';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useProducts } from '@/features/products/hooks/useProducts';
import { formatPrice } from '@/utils/formatPrice';
import { calculateDiscount } from '@/utils/calculateDiscount';
import { FeaturedSlider } from '@/features/home/components/FeaturedSlider';
import { GroceryFeaturedSlider } from '@/features/grocery-shop/components/GroceryFeaturedSlider';
import { TrustBadges } from '@/components/shared/TrustBadges';
import { HomeProductCard } from '@/features/home/components/HomeProductCard';
import { GroceryProductCard } from '@/features/grocery-shop/components/GroceryProductCard';
import type { Product } from '@/types/product';

function IconBag({ size = 18 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" /></svg>);
}
function IconChevronDown({ size = 14 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" /></svg>);
}
function IconArrowLeft({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconArrowRight({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ProductGallery({ images, onActiveChange }: { images: { id: string; src: string; alt: string }[]; onActiveChange?: (index: number) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [mainHeight, setMainHeight] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);
  const thumbContainerRef = useRef<HTMLDivElement>(null);
  const mainWrapRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
    onActiveChange?.(index);
    swiperRef.current?.slideTo(index);
  };

  const handleThumbScroll = (direction: 'prev' | 'next') => {
    if (!thumbContainerRef.current) return;
    const amount = thumbContainerRef.current.clientWidth * 0.7;
    thumbContainerRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = mainWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setMainHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!thumbContainerRef.current) return;
    const activeThumb = thumbContainerRef.current.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeIndex]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    setZooming(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const lightboxPrev = () => {
    const newIdx = (lightboxIndex - 1 + images.length) % images.length;
    setLightboxIndex(newIdx);
    lightboxSwiperRef.current?.slideTo(newIdx);
  };

  const lightboxNext = () => {
    const newIdx = (lightboxIndex + 1) % images.length;
    setLightboxIndex(newIdx);
    lightboxSwiperRef.current?.slideTo(newIdx);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="pdp-gallery-flex">
      {images.length > 1 && (
        <div className="pdp-thumb-wrap">
          <button
            type="button"
            aria-label="Previous thumbnails"
            className="pdp-thumb-arrow pdp-thumb-arrow-prev"
            onClick={() => handleThumbScroll('prev')}
          >
            <IconArrowLeft size={14} />
          </button>
          <div
            ref={thumbContainerRef}
            className="pdp-thumb-vertical flex flex-col gap-[10px] overflow-y-auto"
            style={{ maxHeight: mainHeight > 0 ? `${mainHeight}px` : '700px' }}
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => handleThumbClick(i)}
                className={`pdp-thumb-btn relative w-full aspect-square overflow-hidden shrink-0 border-[2px] border-solid cursor-pointer bg-[#fff] p-0 rounded-[4px] transition-colors duration-200 ease-in-out ${
                  activeIndex === i ? 'border-[#222]' : 'border-transparent'
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 749px) 100px, 90px" />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next thumbnails"
            className="pdp-thumb-arrow pdp-thumb-arrow-next"
            onClick={() => handleThumbScroll('next')}
          >
            <IconArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="pdp-main-col">
        <div
          ref={mainWrapRef}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
          className={`pdp-main-image-wrap relative w-full bg-[#fff] rounded-[8px] border border-solid border-[#f0f0f0] overflow-hidden ${
            zooming ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          <div className="pdp-main-image-spacer w-full pb-[100%]" />

          <div className="absolute top-0 left-0 w-full h-full">
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: '.pdp-swiper-prev',
                nextEl: '.pdp-swiper-next',
              }}
              rewind={true}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              onSlideChange={(swiper) => { setActiveIndex(swiper.activeIndex); onActiveChange?.(swiper.activeIndex); }}
              className="pdp-gallery-swiper w-full h-full"
              speed={400}
            >
              {images.map((img, idx) => (
                <SwiperSlide key={img.id} className="w-full h-full">
                  <img
                    src={img.src} alt={img.alt}
                    onClick={() => openLightbox(idx)}
                    className="w-full h-full object-cover object-center block cursor-pointer"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button className="pdp-swiper-prev pdp-swiper-arrow" aria-label="Previous image"
            onMouseEnter={() => setZooming(false)} onMouseLeave={() => setZooming(true)}>
            <IconArrowLeft size={20} />
          </button>
          <button className="pdp-swiper-next pdp-swiper-arrow" aria-label="Next image"
            onMouseEnter={() => setZooming(false)} onMouseLeave={() => setZooming(true)}>
            <IconArrowRight size={20} />
          </button>

          {zooming && (
            <div
              className="pdp-zoom-lens absolute w-[120px] h-[120px] border-[1.5px] border-solid border-[rgba(0,0,0,0.15)] bg-[rgba(255,255,255,0.2)] pointer-events-none z-10"
              style={{
                left: `clamp(0px, calc(${zoomPos.x}% - 60px), calc(100% - 120px))`,
                top: `clamp(0px, calc(${zoomPos.y}% - 60px), calc(100% - 120px))`,
              }}
            />
          )}
        </div>

        {zooming && images[activeIndex] && (
          <div
            className="pdp-zoom-panel absolute top-0 left-[calc(100%+30px)] w-[520px] bg-[#fff] overflow-hidden z-[9999] border border-solid border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.08)] pointer-events-none"
            style={{
              height: `${Math.min(520, mainHeight)}px`,
            }}
          >
            <div
              className="w-full h-[520px] bg-[length:250%] bg-no-repeat"
              style={{
                backgroundImage: `url("${encodeURI(images[activeIndex].src)}")`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          </div>
        )}
      </div>

      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[999999] bg-[rgba(0,0,0,0.88)] backdrop-blur-[10px] flex items-center justify-center animate-[pdpLightboxIn_350ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
        >
          <span className="absolute top-[18px] left-[24px] text-[rgba(255,255,255,0.6)] text-[14px] font-medium z-10">
            {lightboxIndex + 1} / {images.length}
          </span>

          <button onClick={closeLightbox} className="pdp-lightbox-close absolute top-[14px] right-[20px] bg-transparent border-none cursor-pointer text-[#fff] p-[8px] flex z-10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            className="pdp-lightbox-arrow absolute left-[20px] top-1/2 -translate-y-1/2 z-10 w-[50px] h-[50px] flex items-center justify-center bg-[rgba(255,255,255,0.1)] border-none rounded-full text-[#fff] cursor-pointer transition-colors duration-200 ease-in-out"
          >
            <IconArrowLeft size={22} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            className="pdp-lightbox-arrow absolute right-[20px] top-1/2 -translate-y-1/2 z-10 w-[50px] h-[50px] flex items-center justify-center bg-[rgba(255,255,255,0.1)] border-none rounded-full text-[#fff] cursor-pointer transition-colors duration-200 ease-in-out"
          >
            <IconArrowRight size={22} />
          </button>

          <img
            key={images[lightboxIndex]?.id}
            src={images[lightboxIndex]?.src || ''}
            alt={images[lightboxIndex]?.alt || ''}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[calc(100vw-140px)] max-h-[calc(100vh-40px)] object-contain block animate-[pdpLightboxFade_250ms_ease]"
          />
        </div>,
        document.body
      )}
    </div>
  );
}

function DetailAccordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-solid border-[#e5e5e5]">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-[18px] px-0 text-[16px] font-semibold text-[#222] bg-transparent border-none cursor-pointer">
        {title}
        <span className={`transition-transform duration-300 ease-in-out inline-flex ${open ? 'rotate-180' : 'rotate-0'}`}><IconChevronDown /></span>
      </button>
      <div className={`overflow-hidden transition-[max-height] duration-[400ms] ease-in-out ${open ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="pb-[18px] text-[15px] text-[#555] leading-[1.7]">{children}</div>
      </div>
    </div>
  );
}

function ProductInfoAccordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState(0); 
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? -1 : i);
  };

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`border-b border-solid border-[#e5e5e5] ${i === 0 ? 'border-t border-solid border-[#e5e5e5]' : 'border-t-0'}`}>
            <button
              onClick={() => toggle(i)}
              className="flex items-center justify-between w-full py-[20px] px-0 text-[20px] font-semibold text-[#222] bg-transparent border-none cursor-pointer"
            >
              {item.title}
              <span
                className={`inline-flex items-center justify-center transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 10 6" width="12" height="12">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor" />
                </svg>
              </span>
            </button>
            <div
              ref={(el) => { contentRefs.current[i] = el; }}
              className="overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                maxHeight: isOpen ? `${contentRefs.current[i]?.scrollHeight || 1000}px` : '0',
              }}
            >
              <div className="pb-[22px] text-[15px] text-[#555] leading-[1.7]">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(3);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        return (
          <div key={i} className={`${isFirst ? 'border-t-0' : 'border-t border-solid border-[#e5e5e5]'} ${isLast ? 'border-b-0' : ''}`}>
            <button
              onClick={() => toggle(i)}
              className="pdp-faq-q-btn"
            >
              <span className="flex-1">{item.question}</span>
              <span className="pdp-faq-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 10 10"
                  className={`pdp-faq-icon absolute transition-[opacity,transform] duration-[350ms] ease-in-out ${
                    isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 10 2"
                  className={`pdp-faq-icon absolute transition-[opacity,transform] duration-[350ms] ease-in-out ${
                    isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor" />
                </svg>
              </span>
            </button>
            <div
              ref={(el) => { faqRefs.current[i] = el; }}
              className={`overflow-hidden transition-[max-height,opacity] duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                maxHeight: isOpen ? `${faqRefs.current[i]?.scrollHeight || 500}px` : '0',
              }}
            >
              <div className="pdp-faq-answer-body">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PairsWellWith({ products, productHrefBase = '/products' }: { products: Product[]; productHrefBase?: string }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { openQuickView } = useUIStore();
  const chunkSize = 3;
  const slides: Product[][] = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    slides.push(products.slice(i, i + chunkSize));
  }
  const totalDots = slides.length;

  return (
    <div className="pdp-pairs-section border-t border-solid border-[#e5e5e5] pt-[24px]">
      <h3 className="pdp-pairs-title text-[18px] font-semibold text-[#222] mb-[16px]">Pairs well with</h3>

      <div className="pdp-pairs-track-wrap overflow-hidden">
        <div
          className="pdp-pairs-track flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((group, gi) => (
            <div key={gi} className="pdp-pairs-slide flex-[0_0_100%] flex flex-col gap-0">
              {group.map((p) => (
                <div key={p.id} className="pdp-pairs-row flex items-center gap-[14px] py-[16px] px-0 border-b border-solid border-[#f0f0f0]">
                  <Link href={`${productHrefBase}/${p.slug}`} className="w-[70px] h-[85px] relative overflow-hidden bg-[#f5f5f5] shrink-0 block">
                    <Image src={p.images[0]?.src || ''} alt={p.name} fill className="object-cover" sizes="70px" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`${productHrefBase}/${p.slug}`} className="text-[15px] font-semibold text-[#222] no-underline block mb-[4px]">
                      {p.name}
                    </Link>
                    {(() => {
                      const pDiscount = p.compareAtPrice && p.compareAtPrice > p.price
                        ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
                        : 0;
                      return (
                        <div className="flex items-baseline gap-[6px] flex-wrap">
                          <span className="text-[14px] font-bold text-[#222]">{formatPrice(p.price)}</span>
                          {pDiscount > 0 && (
                            <span className="text-[#F15B41] bg-[#fff0ed] text-[11px] font-bold px-[4px] py-[1px] rounded-[3px] leading-none">
                              -{pDiscount}%
                            </span>
                          )}
                          {p.compareAtPrice && (
                            <span className="text-[12px] text-[#999] line-through font-normal">
                              {formatPrice(p.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => openQuickView(p)}
                    className="pdp-pairs-quick-add py-[10px] px-[20px] text-[13px] font-semibold text-[#222] bg-[#fff] border-[1.5px] border-solid border-[#222] cursor-pointer transition-all duration-200 ease-in-out shrink-0"
                  >
                    Quick Add
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {totalDots > 1 && (
        <div className="flex items-center justify-center gap-[12px] mt-[20px]">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full bg-transparent flex items-center justify-center p-0 cursor-pointer transition-all duration-300 ease-in-out ${
                activeSlide === i ? 'w-[18px] h-[18px] border-[1.5px] border-solid border-[#222]' : 'w-[10px] h-[10px] border-none'
              }`}
            >
              <span
                className={`rounded-full block transition-all duration-300 ease-in-out ${
                  activeSlide === i ? 'w-[8px] h-[8px] bg-[#222]' : 'w-[10px] h-[10px] bg-[#bbb]'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductDetailContentProps {
  slug: string;
  apiEndpoint?: string;
  relatedEndpoint?: string;
  productHrefBase?: string;
  cardVariant?: 'home' | 'grocery';
}

export function ProductDetailContent({
  slug,
  apiEndpoint = '/api/products',
  relatedEndpoint,
  productHrefBase = '/products',
  cardVariant = 'home',
}: ProductDetailContentProps) {
  const router = useRouter();
  const { data, isLoading } = useProduct(slug, { endpoint: apiEndpoint });
  const { data: relatedData } = useProducts({
    limit: 12,
    category: data?.product?.category || undefined,
  }, { endpoint: relatedEndpoint ?? apiEndpoint });
  const { addItem, closeDrawer } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleItem: toggleCompare, isInCompare } = useCompareStore();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const product = data?.product;
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recentlySwiper, setRecentlySwiper] = useState<SwiperType | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(5);
  const [starCounts, setStarCounts] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({});
  const [isBreadcrumbExpanded, setIsBreadcrumbExpanded] = useState(false);
  const hasAutoOpenedReviewRef = useRef(false);

  // ── Review Form States ──
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Auto-open review form only once if accessed via ?writeReview=true
  useEffect(() => {
    if (hasAutoOpenedReviewRef.current) return;
    const isWriteReviewParam = searchParams?.get('writeReview') === 'true';

    if (isWriteReviewParam) {
      hasAutoOpenedReviewRef.current = true;
      setShowReviewForm(true);
      const timer = setTimeout(() => {
        const el = document.getElementById('reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!newComment.trim()) {
      setReviewErrorMsg('Please write your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || '',
          productSlug: product.slug || slug,
          productName: product.name,
          orderId: searchParams?.get('orderNumber') || '',
          rating: newRating,
          title: '',
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        window.dispatchEvent(new CustomEvent('notification-refresh'));
        if (data.review.status === 'approved') {
          setReviewsList((prev) => [data.review, ...prev]);
          setReviewCount((prev) => prev + 1);
          setStarCounts((prev) => ({
            ...prev,
            [newRating]: (prev[newRating] || 0) + 1,
          }));
          setReviewSuccessMsg(
            'Thank you! Your review has been submitted successfully.'
          );
        } else {
          setReviewSuccessMsg(
            'Thank you! Your review has been submitted and will appear on the website once approved by an admin.'
          );
        }
        // Permanently lock auto-open and hide the review form
        hasAutoOpenedReviewRef.current = true;
        setNewComment('');
        setShowReviewForm(false);

        // Remove ?writeReview=true and any hashes from URL
        if (typeof window !== 'undefined') {
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
        }

        // Smooth scroll to top of reviews section
        const el = document.getElementById('reviews');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          setReviewSuccessMsg('');
        }, 5000);
      } else {
        setReviewErrorMsg(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewErrorMsg(err?.message || 'Network error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const handleLikeReview = async (reviewId: string) => {
    if (likedReviewIds[reviewId]) return;
    setLikedReviewIds((prev) => ({ ...prev, [reviewId]: true }));
    setReviewsList((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', reviewId }),
      });
    } catch (e) {
      console.error('Failed to like review:', e);
    }
  };

  const maskAuthor = (name: string) => {
    if (!name) return 'Customer';
    const trimmed = name.trim();
    if (trimmed.length <= 2) return `${trimmed[0]}***`;
    return `${trimmed[0]}***${trimmed[trimmed.length - 1]}`;
  };

  useEffect(() => {
    if (!product) return;
    setReviewsList(product.reviews || []);
    setReviewCount(product.reviewCount || (product.reviews?.length ?? 0));
    setAvgRating(product.rating || 5);

    const q = product.slug ? `slug=${encodeURIComponent(product.slug)}` : `productId=${encodeURIComponent(product.id)}`;
    fetch(`/api/reviews?${q}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.reviews)) {
          setReviewsList(res.reviews);
          setReviewCount(res.count ?? res.reviews.length);
          if (typeof res.averageRating === 'number') setAvgRating(res.averageRating);
          if (res.starCounts) setStarCounts(res.starCounts);
        }
      })
      .catch((err) => console.error('Error fetching reviews:', err));
  }, [product]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');

      if (product.id && product.id.length === 24) {
        fetch('/api/recommendations/recently-viewed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        }).catch(() => {});
      }

      fetch('/api/recommendations/recently-viewed?limit=12', { cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.products)) {
            const others = res.products.filter((p: Product) => p.id !== product.id);
            setRecentlyViewed(others);
          }
        })
        .catch(() => {});
    }
  }, [product]);

  if (isLoading || !product) {
    return (<div className="container-main py-[60px] px-0 text-center text-[16px] text-[#888]">Loading product...</div>);
  }

  const activeColor = selectedColor || product.colors?.[0]?.name || '';
  const activeSize = selectedSize || product.sizes?.[0] || '';
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const relatedProducts = (relatedData?.products || [])
    .filter((p) => p.id !== product.id && p.slug !== product.slug)
    .slice(0, 6);

  const handleWishlistClick = () => {
    setWishlistLoading(true);
    setTimeout(() => {
      toggleWishlist({ productId: product.id, name: product.name, price: product.price, compareAtPrice: product.compareAtPrice, image: product.images?.[0]?.src || '', image2: product.images?.[1]?.src || '', slug: product.slug, badge: product.badge, colors: product.colors?.map(c => ({ name: c.name, value: c.value })) || [], vendor: product.vendor });
      setWishlistLoading(false);
    }, 500);
  };

  const handleCompareClick = () => {
    setCompareLoading(true);
    setTimeout(() => {
      toggleCompare(product);
      setCompareLoading(false);
    }, 500);
  };

  const getActiveVariant = () => {
    if (!product) return null;
    return (
      product.variants?.find((v) => v.color === activeColor && v.size === activeSize) ||
      product.variants?.[0] || {
        id: `v-default-${product.id}`,
        color: activeColor || '',
        size: activeSize || '',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images?.[0]?.src || '',
        available: product.availability === 'in-stock',
        sku: product.sku || '',
      }
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!checkAuthOrRedirect(router)) return;
    const variant = getActiveVariant();
    const variantId = variant?.id || product.id || 'default';
    const image = variant?.image || product.images?.[0]?.src || '';
    setAddingToCart(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        variantId,
        name: product.name,
        slug: product.slug,
        image,
        color: activeColor,
        size: activeSize,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity,
        vendor: product.vendor,
        weight: product.weight || 0,
      });
      setAddingToCart(false);
    }, 400);
  };

  const handleBuyNow = () => {
    if (!checkAuthOrRedirect(router)) return;
    const variant = product.variants?.find(v => v.color === activeColor && v.size === activeSize) || product.variants?.[0];
    const variantId = variant?.id || product.id || 'default';
    const image = variant?.image || product.images?.[0]?.src || '';

    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      slug: product.slug,
      image,
      color: activeColor,
      size: activeSize,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
      vendor: product.vendor,
      weight: product.weight || 0,
    });
    closeDrawer();
    router.push('/checkout');
  };

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const messageLines = [
      `Hello RKF!`,
      `I am interested in this product and would like to ask a few questions:`,
      ``,
      `Product: ${product.name}`,
      `Price: ${formatPrice(product.price)}`,
      product.sku ? `SKU: ${product.sku}` : null,
      activeColor ? `Color: ${activeColor}` : null,
      activeSize ? `Size: ${activeSize}` : null,
      currentUrl ? `Link: ${currentUrl}` : null,
      ``,
      `Could you please help me with more details?`,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/94707992740?text=${encodeURIComponent(messageLines)}`, '_blank', 'noopener,noreferrer');
  };

  const SHOW_EXTRA_SECTIONS = false;

  return (
    <>
      <div className="container-main py-[16px]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-[6px] min-[750px]:gap-[8px] text-[13px] min-[750px]:text-[14px] min-w-0 max-w-full flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/" className="text-[#666] hover:text-[#222] underline underline-offset-[3px] shrink-0 transition-colors">
            Home
          </Link>
          <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>

          {/* Middle collapsed dots on mobile: shown when category exists and path is not expanded */}
          {product.category && !isBreadcrumbExpanded && (
            <span className="inline-flex min-[750px]:hidden items-center gap-[6px] shrink-0">
              <button
                type="button"
                onClick={() => setIsBreadcrumbExpanded(true)}
                aria-label="Show full path"
                className="text-[#777] hover:text-[#222] px-[5px] py-0 rounded bg-[#f0f2f5] hover:bg-[#e4e6ea] text-[12px] font-bold tracking-widest transition-colors cursor-pointer"
              >
                ...
              </button>
              <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>
            </span>
          )}

          {/* Products link: Always visible on desktop; on mobile hidden behind "..." unless expanded */}
          <span className={`${product.category && !isBreadcrumbExpanded ? 'hidden min-[750px]:inline-flex' : 'inline-flex'} items-center gap-[6px] min-[750px]:gap-[8px] shrink-0`}>
            <Link href="/products" className="text-[#666] hover:text-[#222] underline underline-offset-[3px] shrink-0 transition-colors">
              Products
            </Link>
            <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>
          </span>

          {/* Category link:
              - If subcategory exists: this main category is in the middle, so hidden on mobile unless expanded; always visible on desktop.
              - If NO subcategory: this is the direct category, so visible on both mobile and desktop! */}
          {product.category && (
            product.subcategory && product.subcategory !== product.category ? (
              <span className={`${!isBreadcrumbExpanded ? 'hidden min-[750px]:inline-flex' : 'inline-flex'} items-center gap-[6px] min-[750px]:gap-[8px] shrink-0`}>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-[#666] hover:text-[#222] underline underline-offset-[3px] shrink-0 transition-colors"
                >
                  {product.category}
                </Link>
                <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>
              </span>
            ) : (
              <>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-[#666] hover:text-[#222] underline underline-offset-[3px] shrink-0 transition-colors"
                >
                  {product.category}
                </Link>
                <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>
              </>
            )
          )}

          {/* Subcategory link (If present: always visible on both mobile and desktop) */}
          {product.subcategory && product.subcategory !== product.category && (
            <>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                className="text-[#666] hover:text-[#222] underline underline-offset-[3px] shrink-0 transition-colors"
              >
                {product.subcategory}
              </Link>
              <span className="text-[#bbb] text-[11px] shrink-0 select-none">›</span>
            </>
          )}

          {/* Product Name:
              - Mobile: Truncated with ellipsis dots (max-w-[130px] ... min-[750px]:max-w-none)
              - Desktop/PC: Unconstrained full title */}
          <span
            title={product.name}
            className="text-[#222] font-medium whitespace-nowrap overflow-hidden text-ellipsis inline-block shrink min-w-0 max-w-[130px] min-[380px]:max-w-[170px] min-[500px]:max-w-[240px] min-[750px]:max-w-none"
          >
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container-main pdp-product-section">
        <div className="pdp-product-grid">

          <div className="pdp-product-gallery-col">
            <div className="pdp-gallery-sticky">
              <ProductGallery images={product.images} onActiveChange={setActiveGalleryIndex} />
            </div>
          </div>

          <div className="pdp-product-info">
            <div>
              <p className="pdp-info-vendor text-[12px] text-[#888] uppercase tracking-[1.5px] mb-[6px]">{product.vendor}</p>

              <h1 className="pdp-info-title text-[32px] font-semibold text-[#222] mb-[12px]">{product.name}</h1>

              <div className="pdp-info-rating flex items-center gap-[6px] mb-[16px]">
                {Array.from({ length: 5 }).map((_, i) => (<span key={i} className={`pdp-info-star text-[16px] ${i < Math.floor(avgRating) ? 'text-[#F5C518]' : 'text-[#ddd]'}`}>★</span>))}
                <span className="pdp-info-review-count text-[14px] text-[#888]">{reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}</span>
              </div>

              <div className="pdp-info-price-row flex items-baseline gap-[10px] mb-[20px] flex-wrap">
                <span className="pdp-info-price product-price-text text-[28px] font-bold text-[#e01117] leading-tight" style={{ color: "#e01117" }}>
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <span className="text-[#F15B41] text-[15px] font-bold tracking-tight">
                    {discount}% off
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="pdp-info-compare-at text-[16px] text-[#999] line-through font-normal">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.colors.length > 0 && (
                <div className="pdp-info-color mb-[20px]">
                  <p className="pdp-info-field-label text-[15px] font-semibold text-[#222] mb-[10px]">Color: <span className="font-normal text-[#555]">{activeColor}</span></p>
                  <div className="flex gap-[8px]">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`pdp-info-color-swatch w-[32px] h-[32px] rounded-full border-solid cursor-pointer transition-colors duration-200 ease-in-out ${
                          activeColor === c.name ? 'border-[3px] border-[#222]' : 'border-[2px] border-[#e0e0e0]'
                        }`}
                        style={{ backgroundColor: c.value }}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="pdp-info-size mb-[20px]">
                  <p className="pdp-info-field-label text-[15px] font-semibold text-[#222] mb-[10px]">Size: <span className="font-normal text-[#555]">{activeSize}</span></p>
                  <div className="flex gap-[8px] flex-wrap">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`pdp-info-size-btn min-w-[44px] h-[44px] py-0 px-[14px] rounded-[4px] text-[14px] font-medium border-solid cursor-pointer transition-all duration-200 ease-in-out ${
                          activeSize === s
                            ? 'border-[2px] border-[#222] bg-[#222] text-[#fff]'
                            : 'border border-[#e0e0e0] bg-[#fff] text-[#222]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdp-info-qty-block mb-[16px]">
                <p className="pdp-info-field-label text-[15px] font-semibold text-[#222] mb-[10px]">Quantity</p>
                <div className="pdp-info-qty-row flex items-center gap-[14px]">
                  <div className="pdp-qty-stepper inline-flex border border-solid border-[#e5e5e5] rounded-[4px]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="pdp-qty-step-btn w-[40px] h-[44px] flex items-center justify-center bg-transparent border-none cursor-pointer text-[18px] text-[#222]">−</button>
                    <span className="pdp-qty-value w-[40px] h-[44px] flex items-center justify-center text-[15px] font-medium border-l border-r border-solid border-[#e5e5e5]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="pdp-qty-step-btn w-[40px] h-[44px] flex items-center justify-center bg-transparent border-none cursor-pointer text-[18px] text-[#222]">+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`pdp-add-to-cart-btn flex-1 flex items-center justify-center gap-[10px] py-[14px] px-0 text-[#fff] text-[16px] font-semibold border-none rounded-none transition-colors duration-[250ms] ease-in-out ${
                      addingToCart ? 'bg-[#555] cursor-wait opacity-80' : 'bg-[#222] cursor-pointer opacity-100'
                    }`}
                    onMouseEnter={(e) => { if (!addingToCart) e.currentTarget.style.backgroundColor = '#F15B41'; }}
                    onMouseLeave={(e) => { if (!addingToCart) e.currentTarget.style.backgroundColor = '#222'; }}
                  >{addingToCart ? 'Adding...' : <><IconBag size={18} /> Add to cart</>}</button>
                </div>
              </div>

<button
                type="button"
                onClick={handleBuyNow}
                className="pdp-buy-now-btn w-full py-[14px] px-0 bg-[#fff] text-[#222] text-[16px] font-semibold border-[1.5px] border-solid border-[#222] rounded-none cursor-pointer mb-[20px] transition-all duration-[250ms] ease-in-out"
              >
                Buy it now
              </button>

              <div className="pdp-info-actions-row flex items-center gap-[24px] mb-[24px]">
                <button
                  onClick={handleWishlistClick}
                  disabled={wishlistLoading}
                  className={`inline-flex items-center gap-[8px] bg-transparent border-none text-[16px] p-0 transition-colors duration-200 ease-in-out ${
                    wishlistLoading ? 'cursor-wait opacity-50' : 'cursor-pointer opacity-100'
                  } ${inWishlist ? 'text-[#F15B41]' : 'text-[#555]'}`}
                >
                  {wishlistLoading ? (
                    <span className="pdp-btn-spinner w-[18px] h-[18px]" />
                  ) : inWishlist ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                      <path fill="currentColor" d="M417.84 448a15.94 15.94 0 01-11.35-4.72L40.65 75.26a16 16 0 0122.7-22.56l365.83 368a16 16 0 01-11.34 27.3zM364.92 80c-48.09 0-80 29.55-96.92 51-16.88-21.48-48.83-51-96.92-51a107.37 107.37 0 00-31 4.55L168 112c22.26 0 45.81 9 63.94 26.67a123 123 0 0121.75 28.47 16 16 0 0028.6 0 123 123 0 0121.77-28.51C322.19 121 342.66 112 364.92 112c43.15 0 78.62 36.33 79.07 81 .54 53.69-22.75 99.55-57.38 139.52l22.63 22.77c3-3.44 5.7-6.64 8.14-9.6 40-48.75 59.15-98.8 58.61-153C475.37 130.52 425.54 80 364.92 80zM268 432C180.38 372.51 91 297.6 92 193a83.69 83.69 0 012.24-18.39L69 149.14a115.1 115.1 0 00-9 43.49c-.54 54.22 18.63 104.27 58.61 153 18.77 22.87 52.8 59.45 131.39 112.8a31.84 31.84 0 0036 0c20.35-13.81 37.7-26.5 52.58-38.11l-22.66-22.81C300.25 409.6 284.09 421.05 268 432z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                      <path fill="currentColor" d="M462.3 62.7c-54.5-46.4-136-38.7-186.6 13.5L256 96.6l-19.7-20.3C195.5 34.1 113.2 8.7 49.7 62.7c-62.8 53.6-66.1 149.8-9.9 207.8l193.5 199.8c6.2 6.4 14.4 9.7 22.6 9.7 8.2 0 16.4-3.2 22.6-9.7L472 270.5c56.4-58 53.1-154.2-9.7-207.8zm-13.1 185.6L256.4 448.1 62.8 248.3c-38.4-39.6-46.4-115.1 7.7-161.2 54.8-46.8 119.2-12.9 142.8 11.5l42.7 44.1 42.7-44.1c23.2-24 88.2-58 142.8-11.5 54 46 46.1 121.5 7.7 161.2z" />
                    </svg>
                  )}
                  {wishlistLoading ? 'Loading...' : inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              <div className="pdp-share-row flex items-center gap-[20px] mb-[20px] relative">
                <button
                  onClick={() => { const url = encodeURIComponent(window.location.href); window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400'); }}
                  className="pdp-share-btn inline-flex items-center gap-[6px] bg-transparent border-none cursor-pointer text-[#555] text-[14px] p-0 transition-colors duration-200 ease-in-out"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
                  Facebook
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href });
                    } else {
                      setShareMenuOpen(!shareMenuOpen);
                    }
                  }}
                  className="pdp-share-btn inline-flex items-center gap-[6px] bg-transparent border-none cursor-pointer text-[#555] text-[14px] p-0 transition-colors duration-200 ease-in-out"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  Share
                </button>

                {shareMenuOpen && (
                  <div
                    className="pdp-share-dropdown absolute top-[calc(100%+10px)] left-0 z-[100] bg-[#fff] border border-solid border-[#e5e5e5] rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-[20px] px-[24px] w-[320px] animate-[pdpShareDropIn_250ms_cubic-bezier(0.4,0,0.2,1)_forwards]"
                  >
                    <div className="flex items-center justify-between mb-[16px]">
                      <span className="text-[14px] font-semibold text-[#222]">Share link</span>
                      <button onClick={() => setShareMenuOpen(false)} className="bg-transparent border-none cursor-pointer text-[#888] flex p-[2px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-[12px] p-[12px] bg-[#f7f7f7] rounded-[6px] mb-[18px]">
                      <div className="w-[44px] h-[44px] rounded-[6px] overflow-hidden shrink-0 relative bg-[#eee]">
                        <Image src={product.images[0]?.src || ''} alt={product.name} fill className="object-cover" sizes="44px" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#222] whitespace-nowrap overflow-hidden text-ellipsis">{product.name} - {formatPrice(product.price)}</p>
                        <p className="text-[11px] text-[#888] whitespace-nowrap overflow-hidden text-ellipsis">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                      </div>
                    </div>

                    <p className="text-[12px] text-[#888] mb-[12px]">Share using</p>

                    <div className="grid grid-cols-4 gap-[12px]">
                      {[
                        { name: 'Nearby Sharing', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>), action: () => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); } },
                        { name: 'WhatsApp', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>), action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, '_blank'); } },
                        { name: 'Phone call', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>), action: () => {} },
                        { name: 'Gmail', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>), action: () => { window.open(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(window.location.href)}`, '_blank'); } },
                        { name: 'Facebook', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>), action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400'); } },
                        { name: 'LinkedIn', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>), action: () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400'); } },
                        { name: 'Twitter', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#555"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>), action: () => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`, '_blank', 'width=600,height=400'); } },
                        { name: 'Copy link', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>), action: () => { navigator.clipboard.writeText(window.location.href); setShareMenuOpen(false); } },
                      ].map((item) => (
                        <button
                          key={item.name}
                          onClick={() => { item.action(); }}
                          className="flex flex-col items-center gap-[6px] bg-transparent border-none cursor-pointer py-[8px] px-[4px] rounded-[8px] transition-colors duration-150 ease-in-out"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {item.icon}
                          <span className="text-[11px] text-[#555] whitespace-nowrap">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Product Inquiry Action Link */}
              <div className="mb-[24px]">
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="group inline-flex items-center gap-[9px] bg-transparent hover:bg-[#f4fbf6] border border-solid border-[#e5e5e5] hover:border-[#25D366] py-[9px] px-[14px] rounded-[8px] cursor-pointer transition-all duration-200 text-left"
                  aria-label="Have questions? Chat with us on WhatsApp"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="#25D366" className="shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="text-[14px] text-[#222] group-hover:text-[#128C7E] font-medium transition-colors">
                    Have questions? Chat with us on WhatsApp
                  </span>
                  <span className="text-[14px] text-[#888] group-hover:text-[#128C7E] transition-all duration-200 group-hover:translate-x-[3px]">
                    →
                  </span>
                </button>
              </div>

              {relatedProducts.length > 0 && <PairsWellWith products={relatedProducts} productHrefBase={productHrefBase} />}

              <div className="pdp-info-accordion-wrap mt-[16px]">
                <ProductInfoAccordion items={[
                  {
                    title: 'Description',
                    content: (
                      <>
                        <p className={`text-justify md:text-left ${product.features && product.features.length > 0 ? 'mb-[16px]' : 'mb-0'}`}>{product.description}</p>
                        {product.features && product.features.length > 0 && (
                          <div className="mt-[14px]">
                            <p className="font-semibold text-[#222] mb-[8px] text-justify md:text-left">Specifications & Features:</p>
                            <ul className="pl-[20px] m-0 flex flex-col gap-[6px] text-left">
                              {product.features.map((feat, idx) => (
                                <li key={idx} className="text-[#555] text-[14px]">{feat}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ),
                  },
                  {
                    title: 'Shipping and Returns',
                    content: <p className="text-justify md:text-left">Island-wide delivery available across Sri Lanka. Standard shipping takes 2-4 business days. 7-day return policy on eligible items in original packaging.</p>,
                  },
                  {
                    title: 'Return Policies',
                    content: <p className="text-justify md:text-left">Items must be returned in original condition with all tags attached within 30 days of delivery. Refunds will be processed within 5-7 business days after we receive the returned item.</p>,
                  },
                ]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="reviews" className="container-main pdp-reviews-section pt-[40px] pb-[60px]">
        <div className="border-b border-[#e5e7eb] pb-[16px] mb-[28px]">
          <h2 className="text-[clamp(22px,3vw,28px)] font-semibold text-[#222] m-0">
            Ratings &amp; Reviews of {product.name}
          </h2>
        </div>

        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[12px] p-[clamp(16px,2.5vw,28px)] mb-[32px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] md:gap-[32px] items-center">
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left md:border-r md:border-[#e5e7eb] md:pr-[24px]">
              <div className="flex items-baseline gap-[6px]">
                <span className="text-[clamp(38px,4.5vw,52px)] font-black text-[#111827] leading-none tracking-tight">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-[clamp(18px,2vw,22px)] font-medium text-[#6b7280]">/ 5</span>
              </div>
              <div className="flex items-center gap-[4px] my-[10px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-[clamp(20px,2vw,24px)] leading-none ${
                      star <= Math.round(avgRating) ? 'text-[#f59e0b]' : 'text-[#d1d5db]'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-[14px] text-[#4b5563] font-medium m-0">
                {reviewCount} {reviewCount === 1 ? 'Rating' : 'Ratings'}
              </p>
            </div>

            <div className="md:col-span-7 flex flex-col gap-[8px] w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] || 0;
                const percent = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-[10px] text-[13px]">
                    <div className="flex items-center gap-[2px] w-[75px] shrink-0 justify-end">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-[12px] leading-none ${i < star ? 'text-[#f59e0b]' : 'text-[#e5e7eb]'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <div className="flex-1 h-[8px] bg-[#e5e7eb] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="w-[32px] text-right font-medium text-[#4b5563] shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-[14px] mb-[20px] flex-wrap gap-[12px]">
          <h3 className="text-[17px] font-bold text-[#1f2937] m-0">
            Product Reviews ({reviewCount})
          </h3>
          <button
            type="button"
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="inline-flex items-center gap-[8px] bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] font-semibold px-[16px] py-[8px] rounded-[8px] transition-colors shadow-xs cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>{showReviewForm ? 'Close Review Form' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Review Submission Success Banner */}
        {reviewSuccessMsg && (
          <div className="mb-[24px] p-[16px_20px] bg-[#ecfdf5] border border-[#a7f3d0] rounded-[10px] text-[14px] text-[#047857] font-medium flex items-center justify-between gap-[12px] shadow-xs">
            <div className="flex items-center gap-[10px]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-[#059669]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{reviewSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setReviewSuccessMsg('')}
              className="text-[#047857] hover:text-[#065f46] text-[16px] font-bold p-[4px] cursor-pointer shrink-0"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Write Review Interactive Form ── */}
        {showReviewForm && (
          <div className="bg-white border-2 border-[#e5e7eb] rounded-[14px] p-[20px] sm:p-[28px] mb-[32px] shadow-sm">
            <div className="flex items-start justify-between gap-[16px] mb-[20px]">
              <div>
                <h4 className="text-[18px] font-bold text-[#111827] m-0">
                  Share Your Experience with {product.name}
                </h4>
                <p className="text-[13.5px] text-[#6b7280] mt-[4px] m-0">
                  Your feedback helps other customers and validates your verified purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-[#9ca3af] hover:text-[#111827] p-[4px] cursor-pointer text-[16px]"
                aria-label="Close review form"
              >
                ✕
              </button>
            </div>

            {reviewErrorMsg && (
              <div className="mb-[20px] p-[14px_18px] bg-[#fef2f2] border border-[#fecaca] rounded-[8px] text-[14px] text-[#b91c1c] font-medium flex items-center gap-[10px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-[18px]">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[13px] font-bold text-[#374151] uppercase tracking-wider mb-[8px]">
                  Your Overall Rating <span className="text-[#ef4444]">*</span>
                </label>
                <div className="flex items-center gap-[8px]">
                  <div className="flex items-center gap-[4px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setNewHoverRating(star)}
                        onMouseLeave={() => setNewHoverRating(0)}
                        className="text-[28px] leading-none transition-transform hover:scale-110 focus:outline-hidden cursor-pointer p-0 bg-transparent border-none"
                      >
                        <span
                          className={
                            star <= (newHoverRating || newRating)
                              ? 'text-[#f59e0b]'
                              : 'text-[#d1d5db]'
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[14px] font-bold text-[#111827] ml-[6px]">
                    {newRating === 5 && '5 Stars — Excellent!'}
                    {newRating === 4 && '4 Stars — Very Good'}
                    {newRating === 3 && '3 Stars — Average'}
                    {newRating === 2 && '2 Stars — Below Average'}
                    {newRating === 1 && '1 Star — Poor'}
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-[6px]">
                  Your Review <span className="text-[#ef4444]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your review here... What did you like or dislike about this product?"
                  className="w-full px-[14px] py-[10px] text-[14px] bg-[#f9fafb] border border-[#d1d5db] rounded-[8px] focus:bg-white focus:border-[#111827] focus:ring-1 focus:ring-[#111827] outline-hidden transition-all resize-y"
                />
              </div>

              <div className="pt-[6px]">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center gap-[8px] bg-[#111827] hover:bg-[#000] text-white text-[14px] font-bold px-[22px] py-[11px] rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {reviewsList.length === 0 ? (
          <div className="py-[48px] px-[20px] text-center bg-[#f9fafb] rounded-[12px] border border-dashed border-[#d1d5db]">
            <div className="text-[36px] mb-[10px] text-[#9ca3af]">★</div>
            <h4 className="text-[16px] font-semibold text-[#374151] mb-[6px]">No reviews yet</h4>
            <p className="text-[14px] text-[#6b7280] max-w-[420px] mx-auto leading-relaxed m-0">
              This product hasn&apos;t received any customer reviews yet. Verified buyers will be able to share their reviews after receiving their orders.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#f3f4f6]">
            {reviewsList.map((review: any) => (
              <div key={review.id} className="py-[20px] first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-[12px] mb-[8px]">
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[15px] leading-none ${
                          i < (review.rating || 5) ? 'text-[#f59e0b]' : 'text-[#d1d5db]'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] text-[#9ca3af]">{review.date}</span>
                </div>

                <div className="flex items-center gap-[8px] flex-wrap text-[13px] text-[#4b5563] mb-[10px]">
                  <span>
                    by <strong className="text-[#111827] font-semibold">{maskAuthor(review.author)}</strong>
                  </span>
                  {review.verified && (
                    <span className="inline-flex items-center gap-[4px] text-[#16a34a] text-[11px] font-medium bg-[#f0fdf4] px-[8px] py-[2px] rounded-full border border-[#bbf7d0]">
                      <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified Purchase
                    </span>
                  )}
                </div>

                {review.title && review.title !== 'Customer Review' && (
                  <h4 className="text-[15px] font-semibold text-[#111827] mb-[6px]">{review.title}</h4>
                )}

                <p className="text-[14px] text-[#374151] leading-[1.6] mb-[14px] whitespace-pre-line">
                  {review.body}
                </p>

                {Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="flex items-center gap-[10px] flex-wrap mb-[14px]">
                    {review.images.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImage(imgUrl)}
                        className="group relative w-[76px] h-[76px] rounded-[8px] overflow-hidden border border-[#e5e7eb] hover:border-[#f59e0b] transition-all cursor-pointer p-0 bg-[#f9fafb]"
                      >
                        <img
                          src={imgUrl}
                          alt={`Review photo ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-[12px] text-[13px] text-[#6b7280]">
                  <button
                    type="button"
                    onClick={() => handleLikeReview(review.id)}
                    disabled={likedReviewIds[review.id]}
                    className={`inline-flex items-center gap-[6px] py-[4px] px-[10px] rounded-[6px] border text-[13px] transition-colors ${
                      likedReviewIds[review.id]
                        ? 'border-[#111827] bg-[#111827] text-white cursor-default'
                        : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#9ca3af] hover:text-[#111827] cursor-pointer'
                    }`}
                  >
                    <span>👍</span>
                    <span className="font-medium">{review.likes || 0}</span>
                  </button>
                  {likedReviewIds[review.id] && (
                    <span className="text-[12px] text-[#16a34a] font-medium">Thank you for your feedback!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-[16px] backdrop-blur-[2px]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[85vh] bg-white p-[8px] rounded-[12px] shadow-2xl flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-[14px] -right-[14px] w-[32px] h-[32px] rounded-full bg-[#111827] text-white flex items-center justify-center text-[15px] font-bold shadow-lg border-2 border-white hover:bg-[#e11d48] transition-colors cursor-pointer"
                aria-label="Close image preview"
              >
                ✕
              </button>
              <img
                src={previewImage}
                alt="Customer review photo preview"
                className="max-w-full max-h-[80vh] object-contain rounded-[8px]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pdp-related-section">
        {cardVariant === 'grocery' ? (
          <GroceryFeaturedSlider />
        ) : (
          <FeaturedSlider
            apiEndpoint={relatedEndpoint ?? apiEndpoint}
            cardVariant={cardVariant}
            productHrefBase={productHrefBase}
            count={(relatedEndpoint ?? apiEndpoint) === '/api/megastore-products' ? 6 : undefined}
          />
        )}
      </div>

      <div className="container-main pdp-recently-section">
        <h2 className="text-[clamp(22px,3vw,28px)] font-semibold text-[#222] text-left mb-[clamp(22px,2.4vw,30px)]">Recently viewed product</h2>
        {(() => {
          const recentList = recentlyViewed.length > 0
            ? recentlyViewed
            : (relatedData?.products.filter((p) => p.id !== product?.id) || []);
          if (recentList.length === 0) return null;

          return (
            <div className="pdp-recently-slider-wrap relative">
              <Swiper
                modules={[Navigation]}
                onSwiper={setRecentlySwiper}
                slidesPerView={2}
                breakpoints={{
                  750: { slidesPerView: 3, spaceBetween: 20 },
                  992: { slidesPerView: 4, spaceBetween: 24 },
                }}
                spaceBetween={16}
                speed={600}
                style={{ overflow: 'hidden' }}
              >
                {recentList.map((p, i) => (
                  <SwiperSlide key={p.id}>
                    {cardVariant === 'grocery' ? (
                      <GroceryProductCard product={p} index={i} hrefBase={productHrefBase} />
                    ) : (
                      <HomeProductCard product={p} index={i} hrefBase={productHrefBase} />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                type="button"
                onClick={() => recentlySwiper?.slidePrev()}
                aria-label="Previous products"
                className="pdp-recent-nav-prev"
              >
                <IconArrowLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => recentlySwiper?.slideNext()}
                aria-label="Next products"
                className="pdp-recent-nav-next"
              >
                <IconArrowRight size={20} />
              </button>
            </div>
          );
        })()}
      </div>

      <style>{`
        
        @media (min-width: 992px) and (max-width: 1199px) {
          .pdp-recently-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }

        .pdp-thumb-vertical::-webkit-scrollbar { width: 0; display: none; }
        .pdp-thumb-vertical { scrollbar-width: none; }

        .pdp-swiper-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50% !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          background: #ffffff !important;
          color: #111827 !important;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08) !important;
          transition: background-color 200ms ease, color 200ms ease, transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
        }
        .pdp-swiper-arrow:hover {
          background: #111827 !important;
          color: #ffffff !important;
          border-color: #111827 !important;
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
        }
        .pdp-swiper-arrow.swiper-button-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }
        .pdp-swiper-arrow.swiper-button-disabled:hover {
          background: #ffffff !important;
          color: #111827 !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-50%) scale(1) !important;
        }
        .pdp-swiper-prev { left: 14px; }
        .pdp-swiper-next { right: 14px; }

        
        .swiper-button-next, .swiper-button-prev { display: none !important; }

        
        .pdp-gallery-swiper, .pdp-gallery-swiper .swiper-wrapper, .pdp-gallery-swiper .swiper-slide {
          height: 100% !important;
        }

        
        .pdp-pairs-quick-add:hover {
          background-color: #222 !important;
          color: #fff !important;
        }

        
        @keyframes pdpLightboxIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pdpLightboxFade {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .pdp-lightbox-arrow:hover {
          background: rgba(255,255,255,0.25) !important;
        }
        .pdp-lightbox-close:hover {
          opacity: 0.6;
        }

        
        .pdp-btn-spinner {
          display: inline-block;
          border: 2px solid #ddd;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: pdpSpinBtn 500ms linear infinite;
        }
        @keyframes pdpSpinBtn {
          to { transform: rotate(360deg); }
        }

        
        .pdp-share-btn {
          text-decoration: underline !important;
          text-underline-offset: 3px !important;
          text-decoration-color: #ccc !important;
        }
        .pdp-share-btn:hover {
          color: #222 !important;
          text-decoration-color: #222 !important;
        }

        
        @keyframes pdpShareDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        
        
        .pdp-product-section {
          padding-bottom: 80px;
          overflow: visible;
        }
        .pdp-product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(24px, 3.6vw, 50px);
          align-items: start;
          overflow: visible;
        }
        .pdp-product-gallery-col {
          align-self: stretch;
          overflow: visible;
          z-index: 10;
        }
        .pdp-gallery-sticky {
          position: sticky;
          top: 110px;
        }
        .pdp-product-info {
          position: relative;
          z-index: 1;
        }
        
        .pdp-gallery-flex { display: flex; gap: 16px; }
        .pdp-thumb-wrap { width: 90px; flex-shrink: 0; position: relative; }
        .pdp-main-col { flex: 1; position: relative; }
        
        .pdp-thumb-arrow { display: none; }

        

        
        @media (max-width: 991px) {
          .pdp-product-section {
            padding-bottom: clamp(40px, 8vw, 60px);
            overflow-x: hidden !important;
          }

          .pdp-product-grid {
            grid-template-columns: 1fr;
            gap: clamp(20px, 5vw, 32px);
            min-width: 0;
          }
          .pdp-product-gallery-col,
          .pdp-product-info {
            min-width: 0 !important;
          }
          
          .pdp-product-gallery-col {
            align-self: auto;
            z-index: auto;
          }
          .pdp-gallery-sticky {
            position: static;
            top: auto;
          }

          
          .pdp-gallery-flex {
            flex-direction: column-reverse;
            gap: 12px;
            min-width: 0;
          }

          
          .pdp-thumb-wrap {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            position: relative;
          }
          .pdp-main-col {
            min-width: 0 !important;
            max-width: 100% !important;
          }
          
          .pdp-thumb-vertical {
            flex-direction: row !important;
            max-height: none !important;
            overflow-y: hidden !important;
            overflow-x: auto;
            gap: 8px !important;
            padding: 0 36px;
            scroll-behavior: smooth;
          }
          .pdp-thumb-btn {
            width: clamp(70px, 18vw, 100px) !important;
            height: auto !important;
          }
          
          .pdp-thumb-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 1px solid #e0e0e0;
            background: #fff;
            color: #222;
            cursor: pointer;
            z-index: 5;
            padding: 0;
            transition: background-color 180ms ease, color 180ms ease;
          }
          .pdp-thumb-arrow:hover { background: #222; color: #fff; border-color: #222; }
          .pdp-thumb-arrow-prev { left: 0; }
          .pdp-thumb-arrow-next { right: 0; }

          
          .pdp-main-image-wrap {
            height: clamp(400px, calc(70vw + 176px), 700px);
          }
          .pdp-main-image-spacer { padding-bottom: 0 !important; }

          
          .pdp-zoom-lens, .pdp-zoom-panel { display: none !important; }

          
          .pdp-product-gallery-col .pdp-swiper-arrow {
            width: 38px;
            height: 38px;
          }

          
          .pdp-info-vendor {
            font-size: clamp(11px, 3.1vw, 12px) !important;
            letter-spacing: 1.2px !important;
            margin-bottom: 8px !important;
          }
          .pdp-info-title {
            font-size: clamp(22px, 6vw, 28px) !important;
            margin-bottom: 16px !important;
          }
          .pdp-info-rating { gap: 4px !important; margin-bottom: 20px !important; }
          .pdp-info-star { font-size: clamp(14px, 4vw, 16px) !important; }
          .pdp-info-review-count { font-size: clamp(12px, 3.4vw, 14px) !important; }
          .pdp-info-price-row {
            gap: clamp(8px, 2.2vw, 12px) !important;
            margin-bottom: 22px !important;
          }
          .pdp-info-compare-at { font-size: clamp(15px, 4.4vw, 18px) !important; }
          .pdp-info-price { font-size: clamp(20px, 5.4vw, 24px) !important; }
          .pdp-info-description {
            font-size: clamp(13px, 3.6vw, 15px) !important;
            line-height: 1.65 !important;
            margin-bottom: 26px !important;
          }
          .pdp-info-color, .pdp-info-size {
            margin-bottom: 24px !important;
          }
          .pdp-info-field-label {
            font-size: clamp(13px, 3.7vw, 15px) !important;
            margin-bottom: 12px !important;
          }
          .pdp-info-color-swatch {
            width: clamp(26px, 7.2vw, 32px) !important;
            height: clamp(26px, 7.2vw, 32px) !important;
          }
          .pdp-info-size-btn {
            min-width: clamp(38px, 10.8vw, 44px) !important;
            height: clamp(38px, 10.8vw, 44px) !important;
            padding: 0 clamp(10px, 3vw, 14px) !important;
            font-size: clamp(13px, 3.6vw, 14px) !important;
          }

          
          .pdp-info-qty-block { margin-bottom: 20px !important; }
          .pdp-info-qty-row { gap: clamp(10px, 2.8vw, 14px) !important; }
          .pdp-qty-stepper {
            border-radius: 999px !important;
          }
          .pdp-qty-step-btn {
            width: clamp(36px, 9.6vw, 40px) !important;
            height: clamp(40px, 11vw, 44px) !important;
            font-size: clamp(16px, 4.4vw, 18px) !important;
          }
          .pdp-qty-value {
            width: clamp(36px, 9.6vw, 40px) !important;
            height: clamp(40px, 11vw, 44px) !important;
            font-size: clamp(13px, 3.6vw, 15px) !important;
          }
          .pdp-add-to-cart-btn {
            border-radius: 999px !important;
            padding: clamp(12px, 3.2vw, 14px) 0 !important;
            font-size: clamp(14px, 3.8vw, 16px) !important;
          }
          .pdp-buy-now-btn {
            border-radius: 999px !important;
            padding: clamp(12px, 3.2vw, 14px) 0 !important;
            font-size: clamp(14px, 3.8vw, 16px) !important;
            margin-bottom: 24px !important;
          }

          
          .pdp-info-actions-row {
            gap: clamp(16px, 4.6vw, 24px) !important;
            margin-bottom: 24px !important;
            flex-wrap: wrap;
          }

          
          .pdp-share-row {
            gap: clamp(14px, 4vw, 20px) !important;
            margin-bottom: 28px !important;
            flex-wrap: wrap;
            row-gap: 12px;
          }

          
          .pdp-share-dropdown {
            width: min(320px, calc(100vw - 32px)) !important;
            padding: 16px 18px !important;
          }

          
          .pdp-pairs-section {
            display: none !important;
          }
        }

        
        @media (max-width: 749px) {
          .pdp-thumb-wrap {
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .pdp-thumb-vertical {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 0 32px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          .pdp-thumb-btn {
            flex: 0 0 calc((100vw - 128px) / 3) !important;
            width: calc((100vw - 128px) / 3) !important;
            max-width: calc((100vw - 128px) / 3) !important;
            height: auto !important;
            box-sizing: border-box !important;
          }
        }

        
        .pdp-faq-section {
          padding-block: clamp(48px, 6vw, 80px);
        }
        .pdp-faq-header {
          text-align: center;
          margin-bottom: clamp(28px, 3.5vw, 40px);
        }
        .pdp-faq-title {
          font-size: clamp(22px, 2.4vw, 28px);
          font-weight: 600;
          color: #222;
          margin-bottom: 8px;
        }
        .pdp-faq-subtitle {
          font-size: clamp(13px, 1.2vw, 14px);
          color: #888;
        }
        .pdp-faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          align-items: stretch;
        }
        .pdp-faq-left {
          padding-right: clamp(24px, 4vw, 60px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: clamp(560px, 62vw, 750px);
        }
        .pdp-faq-right {
          position: relative;
          height: clamp(560px, 62vw, 750px);
          overflow: hidden;
        }
        
        .pdp-faq-q-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: clamp(16px, 1.8vw, 22px) 0;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 600;
          color: #222;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          gap: clamp(12px, 1.3vw, 16px);
        }
        .pdp-faq-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          position: relative;
        }
        .pdp-faq-icon { width: 20px; height: 20px; }
        .pdp-faq-answer-body {
          padding-bottom: clamp(16px, 1.8vw, 22px);
          font-size: clamp(13px, 1.2vw, 14px);
          color: #555;
          line-height: 1.7;
          white-space: pre-line;
        }

        
        @media (min-width: 992px) and (max-width: 1199px) {
          .pdp-faq-left { min-height: 600px; }
          .pdp-faq-right { height: 600px; }
        }

        
        @media (min-width: 750px) and (max-width: 991px) {
          .pdp-faq-section { padding-block: clamp(36px, 5vw, 48px); }
          .pdp-faq-header { margin-bottom: clamp(20px, 3vw, 28px); }
          .pdp-faq-title { font-size: clamp(20px, 2.6vw, 22px); }
          .pdp-faq-subtitle { font-size: clamp(13px, 1.5vw, 14px); }
          .pdp-faq-grid {
            grid-template-columns: 1fr;
            gap: clamp(20px, 3vw, 28px);
          }
          .pdp-faq-left {
            padding-right: 0;
            min-height: 0;
          }
          .pdp-faq-right { height: 600px; order: -1; }
          .pdp-faq-q-btn {
            padding: clamp(13px, 1.7vw, 16px) 0;
            font-size: clamp(17px, 2.2vw, 20px);
            gap: clamp(10px, 1.3vw, 14px);
          }
          .pdp-faq-answer-body {
            padding-bottom: clamp(13px, 1.7vw, 16px);
            font-size: clamp(13px, 1.5vw, 14px);
          }
        }

        
        @media (max-width: 749px) {
          .pdp-faq-section { padding-block: 0; }
          .pdp-faq-header { margin-bottom: clamp(16px, 4vw, 24px); }
          .pdp-faq-title { font-size: clamp(18px, 5vw, 22px); }
          .pdp-faq-subtitle { font-size: clamp(12px, 3.4vw, 14px); }
          .pdp-faq-grid {
            grid-template-columns: 1fr;
            gap: clamp(16px, 4vw, 24px);
          }
          .pdp-faq-left {
            padding-right: 0;
            min-height: 0;
          }
          .pdp-faq-right { height: 400px; order: -1; }
          .pdp-faq-q-btn {
            padding: clamp(12px, 3.4vw, 16px) 0;
            font-size: clamp(15px, 4.4vw, 18px);
            gap: clamp(8px, 2.5vw, 12px);
          }
          .pdp-faq-answer-body {
            padding-bottom: clamp(12px, 3.4vw, 16px);
            font-size: clamp(12px, 3.4vw, 14px);
          }
          .pdp-faq-icon-wrap {
            width: clamp(18px, 5vw, 22px);
            height: clamp(18px, 5vw, 22px);
          }
          .pdp-faq-icon {
            width: clamp(14px, 4.2vw, 18px);
            height: clamp(14px, 4.2vw, 18px);
          }
        }

        
        .pdp-reviews-section { padding-bottom: clamp(48px, 6vw, 80px); }
        .pdp-recently-section {
          margin-top: clamp(36px, 4vw, 52px);
          padding-bottom: clamp(48px, 6vw, 80px);
        }
        .pdp-recently-slider-wrap {
          position: relative;
        }
        .pdp-recent-nav-prev,
        .pdp-recent-nav-next {
          position: absolute;
          top: 38%;
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
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
          transition: background-color 250ms ease, border-color 250ms ease, color 250ms ease, transform 200ms ease;
        }
        .pdp-recent-nav-prev {
          left: 8px;
        }
        .pdp-recent-nav-next {
          right: 8px;
        }
        .pdp-recent-nav-prev:hover,
        .pdp-recent-nav-next:hover {
          background-color: #000;
          border-color: #000;
          color: #fff;
        }
        @media (max-width: 749px) {
          .pdp-recent-nav-prev,
          .pdp-recent-nav-next {
            display: none !important;
          }
        }

        
        .pdp-trust-section > section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        
        @media (min-width: 750px) and (max-width: 991px) {
          .pdp-recently-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .pdp-recently-grid .fc-card > div:not([class]) a { font-size: clamp(13px, 1.6vw, 15px) !important; }
          .pdp-recently-grid .fc-card > div:not([class]) span { font-size: clamp(12px, 1.4vw, 14px) !important; }
        }

        @media (max-width: 749px) {
          
          .pdp-recently-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(10px, 2.5vw, 16px) !important;
          }
          
          .pdp-recently-grid .fc-card > div:not([class]) a {
            font-size: clamp(11px, 3.4vw, 14px) !important;
          }
          
          .pdp-recently-grid .fc-card > div:not([class]) span {
            font-size: clamp(10px, 3vw, 13px) !important;
          }
          
          .pdp-recently-grid .fc-card > a:first-child {
            margin-bottom: clamp(8px, 2vw, 12px) !important;
          }
        }

        
        
        @media (max-width: 749px) {
          .pdp-product-section  { padding-bottom: 0; }
          .pdp-reviews-section  { padding-bottom: 0; margin-top: 60px; }
          .pdp-related-section  { margin-top: 60px; }
          .pdp-trust-section    { margin-top: 60px !important; }
          .pdp-faq-section      { margin-top: 60px; }
          .pdp-recently-section { padding-bottom: 60px; margin-top: 60px; }
        }
      `}</style>
    </>
  );
}
