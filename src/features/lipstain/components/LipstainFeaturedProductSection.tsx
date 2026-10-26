'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCompareStore } from '@/store/compareStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/formatPrice';
import { calculateDiscount } from '@/utils/calculateDiscount';
import type { Product } from '@/types/product';

const ACCENT = '#c9173c';

/* ── Icons ── */
function IconBag({ size = 18 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" /></svg>);
}
function IconArrowLeft({ size = 16 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" /></svg>);
}
function IconArrowRight({ size = 16 }: { size?: number }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" /></svg>);
}

/* ── Product Gallery ── */
function ProductGallery({
  images,
  onActiveChange,
}: {
  images: { id: string; src: string; alt: string }[];
  onActiveChange?: (index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [wideEnough, setWideEnough] = useState(false);
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
    thumbContainerRef.current.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = mainWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setMainHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const check = () => setWideEnough(window.innerWidth >= 1200);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const container = thumbContainerRef.current;
    if (!container) return;
    const activeThumb = container.children[activeIndex] as HTMLElement;
    if (!activeThumb) return;
    const thumbRect = activeThumb.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    if (thumbRect.top < containerRect.top) {
      container.scrollTo({ top: container.scrollTop - (containerRect.top - thumbRect.top), behavior: 'smooth' });
    } else if (thumbRect.bottom > containerRect.bottom) {
      container.scrollTo({ top: container.scrollTop + (thumbRect.bottom - containerRect.bottom), behavior: 'smooth' });
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
    <div className="lsfps-gallery-flex">
      {images.length > 1 && (
        <div className="lsfps-thumb-wrap">
          <button type="button" aria-label="Previous thumbnails" className="lsfps-thumb-arrow lsfps-thumb-arrow-prev" onClick={() => handleThumbScroll('prev')}>
            <IconArrowLeft size={14} />
          </button>
          <div ref={thumbContainerRef} className="lsfps-thumb-vertical"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: mainHeight > 0 ? `${mainHeight}px` : '700px', overflowY: 'auto' }}>
            {images.map((img, i) => (
              <button key={img.id} onClick={() => handleThumbClick(i)} className="lsfps-thumb-btn" style={{
                position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', flexShrink: 0,
                border: activeIndex === i ? `2px solid ${ACCENT}` : '2px solid transparent',
                cursor: 'pointer', backgroundColor: '#f5f5f5', padding: 0, transition: 'border-color 200ms ease',
              }}>
                <Image src={img.src} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 749px) 100px, 90px" />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next thumbnails" className="lsfps-thumb-arrow lsfps-thumb-arrow-next" onClick={() => handleThumbScroll('next')}>
            <IconArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="lsfps-main-col">
        <div ref={mainWrapRef} onMouseEnter={() => wideEnough && setZooming(true)} onMouseLeave={() => setZooming(false)} onMouseMove={handleMouseMove}
          className="lsfps-main-image-wrap"
          style={{ position: 'relative', width: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', cursor: zooming ? 'crosshair' : 'default' }}>
          <div className="lsfps-main-image-spacer" style={{ width: '100%', paddingBottom: '133.33%' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Swiper
              modules={[Navigation]}
              navigation={{ prevEl: '.lsfps-swiper-prev', nextEl: '.lsfps-swiper-next' }}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              onSlideChange={(swiper) => { setActiveIndex(swiper.activeIndex); onActiveChange?.(swiper.activeIndex); }}
              className="lsfps-gallery-swiper"
              style={{ width: '100%', height: '100%' }}
              speed={400}
            >
              {images.map((img, idx) => (
                <SwiperSlide key={img.id} style={{ width: '100%', height: '100%' }}>
                  <img src={img.src} alt={img.alt} onClick={() => openLightbox(idx)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <button className="lsfps-swiper-prev lsfps-swiper-arrow" aria-label="Previous image"
            onMouseEnter={() => setZooming(false)} onMouseLeave={() => setZooming(true)}>
            <IconArrowLeft size={16} />
          </button>
          <button className="lsfps-swiper-next lsfps-swiper-arrow" aria-label="Next image"
            onMouseEnter={() => setZooming(false)} onMouseLeave={() => setZooming(true)}>
            <IconArrowRight size={16} />
          </button>
          {zooming && (
            <div className="lsfps-zoom-lens" style={{
              position: 'absolute', width: '120px', height: '120px',
              border: '1.5px solid rgba(0,0,0,0.15)', backgroundColor: 'rgba(255,255,255,0.2)',
              pointerEvents: 'none', zIndex: 10,
              left: `clamp(0px, calc(${zoomPos.x}% - 60px), calc(100% - 120px))`,
              top: `clamp(0px, calc(${zoomPos.y}% - 60px), calc(100% - 120px))`,
            }} />
          )}
        </div>
        {zooming && images[activeIndex] && (
          <div className="lsfps-zoom-panel" style={{
            position: 'absolute', top: 0, left: 'calc(100% + 30px)',
            width: '520px', height: `${Math.min(520, mainHeight)}px`,
            backgroundColor: '#fff', overflow: 'hidden', zIndex: 9999,
            border: '1px solid #e5e5e5', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', pointerEvents: 'none',
          }}>
            <div style={{
              width: '100%', height: '520px',
              backgroundImage: `url("${encodeURI(images[activeIndex].src)}")`,
              backgroundSize: '250%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
        )}
      </div>

      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={closeLightbox} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'lsfpsLightboxIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          <span style={{ position: 'absolute', top: '18px', left: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500, zIndex: 10 }}>
            {lightboxIndex + 1} / {images.length}
          </span>
          <button onClick={closeLightbox} style={{ position: 'absolute', top: '14px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '8px', display: 'flex', zIndex: 10 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} style={{
            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', transition: 'background-color 200ms ease',
          }}><IconArrowLeft size={22} /></button>
          <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', transition: 'background-color 200ms ease',
          }}><IconArrowRight size={22} /></button>
          <img key={images[lightboxIndex]?.id} src={images[lightboxIndex]?.src || ''} alt={images[lightboxIndex]?.alt || ''}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 'calc(100vw - 140px)', maxHeight: 'calc(100vh - 40px)', objectFit: 'contain', display: 'block', animation: 'lsfpsLightboxFade 250ms ease' }} />
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Product Info Accordion ── */
function ProductInfoAccordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderTop: i === 0 ? '1px solid #e5e5e5' : 'none', borderBottom: '1px solid #e5e5e5' }}>
            <button onClick={() => toggle(i)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '20px 0', fontSize: '20px', fontWeight: 600,
              color: '#222', background: 'none', border: 'none', cursor: 'pointer',
            }}>
              {item.title}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 10 6" width="12" height="12">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor" />
                </svg>
              </span>
            </button>
            <div ref={(el) => { contentRefs.current[i] = el; }}
              style={{ maxHeight: isOpen ? `${contentRefs.current[i]?.scrollHeight || 1000}px` : '0', overflow: 'hidden', transition: 'max-height 400ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <div style={{ paddingBottom: '22px', fontSize: '15px', color: '#555', lineHeight: 1.7 }}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Pairs Well With ── */
function PairsWellWith({ products }: { products: Product[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { openQuickView } = useUIStore();
  const chunkSize = 3;
  const slides: Product[][] = [];
  for (let i = 0; i < products.length; i += chunkSize) slides.push(products.slice(i, i + chunkSize));
  const totalDots = slides.length;

  return (
    <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#222', marginBottom: '16px' }}>Pairs well with</h3>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', transition: 'transform 500ms ease', transform: `translateX(-${activeSlide * 100}%)` }}>
          {slides.map((group, gi) => (
            <div key={gi} style={{ flex: '0 0 100%', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {group.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Link href={`/products/${p.slug}`} style={{ width: '70px', height: '85px', position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5', flexShrink: 0, display: 'block' }}>
                    <Image src={p.images[0]?.src || ''} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="70px" />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/products/${p.slug}`} style={{ fontSize: '15px', fontWeight: 600, color: '#222', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>{p.name}</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.compareAtPrice && <span style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through' }}>{formatPrice(p.compareAtPrice)}</span>}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{formatPrice(p.price)}</span>
                    </div>
                  </div>
                  <button onClick={() => openQuickView(p)}
                    style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#222', backgroundColor: '#fff', border: '1.5px solid #222', cursor: 'pointer', transition: 'all 200ms ease', flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#222'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#222'; }}>
                    Quick Add
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {totalDots > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} aria-label={`Slide ${i + 1}`} style={{
              width: activeSlide === i ? '18px' : '10px', height: activeSlide === i ? '18px' : '10px',
              borderRadius: '50%', border: activeSlide === i ? `1.5px solid ${ACCENT}` : 'none',
              backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', transition: 'all 300ms ease',
            }}>
              <span style={{ width: activeSlide === i ? '8px' : '10px', height: activeSlide === i ? '8px' : '10px', borderRadius: '50%', backgroundColor: activeSlide === i ? ACCENT : '#bbb', display: 'block', transition: 'all 300ms ease' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="container-main lsfps-section">
      <div className="lsfps-heading-row">
        <div className="animate-shimmer" style={{ height: '32px', width: '220px', borderRadius: '4px' }} />
        <div className="animate-shimmer" style={{ height: '20px', width: '100px', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', gap: 'clamp(24px, 3.6vw, 50px)' }}>
        <div className="animate-shimmer" style={{ aspectRatio: '3/4', borderRadius: '4px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[80, 200, 100, 60, 44, 44, 44].map((h, i) => (
            <div key={i} className="animate-shimmer" style={{ height: `${h}px`, borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function LipstainFeaturedProductSection() {
  const router = useRouter();
  const { data, isLoading } = useProducts({ limit: 10 }, { endpoint: '/api/lipstain-products' });
  const products = data?.products ?? [];
  const product = products[0];
  const relatedProducts = products.slice(1, 7);

  const { addItem, closeDrawer } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleItem: toggleCompare, isInCompare } = useCompareStore();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
    }
  }, [product?.id]);

  if (isLoading || !product) return <Skeleton />;

  const activeColor = selectedColor || product.colors?.[0]?.name || '';
  const activeSize = selectedSize || product.sizes?.[0] || '';
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleWishlistClick = () => {
    setWishlistLoading(true);
    setTimeout(() => {
      toggleWishlist({ productId: product.id, name: product.name, price: product.price, compareAtPrice: product.compareAtPrice, image: product.images?.[0]?.src || '', image2: product.images?.[1]?.src || '', slug: product.slug, badge: product.badge, colors: product.colors?.map(c => ({ name: c.name, value: c.value })) || [], vendor: product.vendor });
      setWishlistLoading(false);
    }, 500);
  };

  const handleCompareClick = () => {
    setCompareLoading(true);
    setTimeout(() => { toggleCompare(product); setCompareLoading(false); }, 500);
  };

  const handleAddToCart = () => {
    const variant = product.variants?.find(v => v.color === activeColor && v.size === activeSize) || product.variants?.[0];
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
        stock: product.stock,
      });
      setAddingToCart(false);
    }, 400);
  };

  const handleBuyNow = () => {
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
      stock: product.stock,
    });
    closeDrawer();
    router.push('/checkout');
  };

  return (
    <>
      <section className="lsfps-outer">
        <div className="container-main lsfps-product-section lsfps-section">
          {/* Section heading */}
          <div className="lsfps-heading-row">
            <h2 className="lsfps-heading">Featured Product</h2>
            <Link href="/shop" className="lsfps-view-all">
              View All <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="lsfps-product-grid">
            {/* ─── Left: Gallery ─── */}
            <div className="lsfps-product-gallery-col">
              <ProductGallery images={product.images} />
            </div>

            {/* ─── Right: Info ─── */}
            <div className="lsfps-product-info">
              <div>
                {/* Vendor */}
                <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>{product.vendor}</p>

                {/* Title */}
                <h3 className="lsfps-info-title" style={{ fontSize: '32px', fontWeight: 600, color: '#222', marginBottom: '12px' }}>{product.name}</h3>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '16px', color: i < Math.floor(product.rating) ? '#F5C518' : '#ddd' }}>★</span>
                  ))}
                  <span style={{ fontSize: '14px', color: '#888' }}>{product.reviewCount} Reviews</span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {product.compareAtPrice && <span style={{ fontSize: '18px', color: '#999', textDecoration: 'line-through' }}>{formatPrice(product.compareAtPrice)}</span>}
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#222' }}>{formatPrice(product.price)}</span>
                  {product.badge === 'sale' && <span style={{ backgroundColor: ACCENT, color: '#fff', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '3px' }}>Sale</span>}
                  {discount > 0 && <span style={{ backgroundColor: '#222', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '3px' }}>-{discount}%</span>}
                </div>

                {/* Description */}
                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>{product.description}</p>

                {/* Color */}
                {product.colors.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#222', marginBottom: '10px' }}>Color: <span style={{ fontWeight: 400, color: '#555' }}>{activeColor}</span></p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {product.colors.map((c) => (
                        <button key={c.name} onClick={() => setSelectedColor(c.name)}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c.value, border: activeColor === c.name ? `3px solid ${ACCENT}` : '2px solid #e0e0e0', cursor: 'pointer', transition: 'border-color 200ms ease' }}
                          aria-label={c.name} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {product.sizes.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#222', marginBottom: '10px' }}>Size: <span style={{ fontWeight: 400, color: '#555' }}>{activeSize}</span></p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {product.sizes.map((s) => (
                        <button key={s} onClick={() => setSelectedSize(s)}
                          style={{ minWidth: '44px', height: '44px', padding: '0 14px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, border: activeSize === s ? `2px solid ${ACCENT}` : '1px solid #e0e0e0', backgroundColor: activeSize === s ? ACCENT : '#fff', color: activeSize === s ? '#fff' : '#222', cursor: 'pointer', transition: 'all 200ms ease' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity + Add to Cart */}
                <div style={{ marginBottom: '16px', maxWidth: '440px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#222', marginBottom: '10px' }}>Quantity</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'inline-flex', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: '40px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#222' }}>−</button>
                      <span style={{ width: '40px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 500, borderLeft: '1px solid #e5e5e5', borderRight: '1px solid #e5e5e5' }}>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}
                        style={{ width: '40px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#222' }}>+</button>
                    </div>
                    <button onClick={handleAddToCart} disabled={addingToCart} className="lsfps-add-to-cart-btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 0', backgroundColor: addingToCart ? '#888' : ACCENT, color: '#fff', fontSize: '16px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: addingToCart ? 'wait' : 'pointer', transition: 'background-color 250ms ease', opacity: addingToCart ? 0.8 : 1 }}
                      onMouseEnter={(e) => { if (!addingToCart) e.currentTarget.style.backgroundColor = '#a81030'; }}
                      onMouseLeave={(e) => { if (!addingToCart) e.currentTarget.style.backgroundColor = ACCENT; }}
                    >{addingToCart ? 'Adding...' : <><IconBag size={18} /> Add to cart</>}</button>
                  </div>
                </div>

                {/* Buy it now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="lsfps-buy-now-btn"
                  style={{ width: '440px', maxWidth: '100%', display: 'block', padding: '14px 0', backgroundColor: '#fff', color: '#222', fontSize: '16px', fontWeight: 600, border: '1.5px solid #222', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', transition: 'all 250ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#222'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#222'; }}
                >Buy it now</button>

                {/* Wishlist + Compare */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                  <button onClick={handleWishlistClick} disabled={wishlistLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: wishlistLoading ? 'wait' : 'pointer', color: inWishlist ? ACCENT : '#555', fontSize: '16px', padding: 0, transition: 'color 200ms ease', opacity: wishlistLoading ? 0.5 : 1 }}>
                    {wishlistLoading ? (
                      <span className="lsfps-btn-spinner" style={{ width: '18px', height: '18px' }} />
                    ) : inWishlist ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18"><path fill="currentColor" d="M417.84 448a15.94 15.94 0 01-11.35-4.72L40.65 75.26a16 16 0 0122.7-22.56l365.83 368a16 16 0 01-11.34 27.3zM364.92 80c-48.09 0-80 29.55-96.92 51-16.88-21.48-48.83-51-96.92-51a107.37 107.37 0 00-31 4.55L168 112c22.26 0 45.81 9 63.94 26.67a123 123 0 0121.75 28.47 16 16 0 0028.6 0 123 123 0 0121.77-28.51C322.19 121 342.66 112 364.92 112c43.15 0 78.62 36.33 79.07 81 .54 53.69-22.75 99.55-57.38 139.52l22.63 22.77c3-3.44 5.7-6.64 8.14-9.6 40-48.75 59.15-98.8 58.61-153C475.37 130.52 425.54 80 364.92 80zM268 432C180.38 372.51 91 297.6 92 193a83.69 83.69 0 012.24-18.39L69 149.14a115.1 115.1 0 00-9 43.49c-.54 54.22 18.63 104.27 58.61 153 18.77 22.87 52.8 59.45 131.39 112.8a31.84 31.84 0 0036 0c20.35-13.81 37.7-26.5 52.58-38.11l-22.66-22.81C300.25 409.6 284.09 421.05 268 432z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18"><path fill="currentColor" d="M462.3 62.7c-54.5-46.4-136-38.7-186.6 13.5L256 96.6l-19.7-20.3C195.5 34.1 113.2 8.7 49.7 62.7c-62.8 53.6-66.1 149.8-9.9 207.8l193.5 199.8c6.2 6.4 14.4 9.7 22.6 9.7 8.2 0 16.4-3.2 22.6-9.7L472 270.5c56.4-58 53.1-154.2-9.7-207.8zm-13.1 185.6L256.4 448.1 62.8 248.3c-38.4-39.6-46.4-115.1 7.7-161.2 54.8-46.8 119.2-12.9 142.8 11.5l42.7 44.1 42.7-44.1c23.2-24 88.2-58 142.8-11.5 54 46 46.1 121.5 7.7 161.2z" /></svg>
                    )}
                    {wishlistLoading ? 'Loading...' : inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                  <button onClick={handleCompareClick} disabled={compareLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: compareLoading ? 'wait' : 'pointer', color: inCompare ? ACCENT : '#555', fontSize: '16px', padding: 0, transition: 'color 200ms ease', opacity: compareLoading ? 0.5 : 1 }}>
                    {compareLoading ? (
                      <span className="lsfps-btn-spinner" style={{ width: '18px', height: '18px' }} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <line x1="17" y1="3" x2="17" y2="21" />
                        <path d="M10 18l-3 3l-3 -3" />
                        <line x1="7" y1="21" x2="7" y2="3" />
                        <path d="M20 6l-3 -3l-3 3" />
                      </svg>
                    )}
                    {compareLoading ? 'Loading...' : inCompare ? 'Remove from Compare' : 'Add to Compare'}
                  </button>
                </div>

                {/* Share row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', position: 'relative' }}>
                  <button onClick={() => { const url = encodeURIComponent(window.location.href); window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400'); }}
                    className="lsfps-share-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', padding: 0, transition: 'color 200ms ease' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
                    Facebook
                  </button>
                  <button onClick={() => { const url = encodeURIComponent(window.location.href); const text = encodeURIComponent(product.name); window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400'); }}
                    className="lsfps-share-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', padding: 0, transition: 'color 200ms ease' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Twitter
                  </button>
                  <button onClick={() => { const url = encodeURIComponent(window.location.href); const media = encodeURIComponent(window.location.origin + (product.images[0]?.src || '')); const desc = encodeURIComponent(product.name); window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${desc}`, '_blank', 'width=600,height=400'); }}
                    className="lsfps-share-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', padding: 0, transition: 'color 200ms ease' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 21.54C10 21.83 10.97 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 15.72 3.97 18.97 6.91 20.73C6.81 19.71 6.19 17.15 6.19 17.15L7.85 10.34C7.85 10.34 7.41 9.47 7.41 8.18C7.41 6.15 8.59 4.63 10.06 4.63C11.3 4.63 11.9 5.56 11.9 6.68C11.9 7.94 11.11 9.84 10.69 11.59C10.34 13.06 11.44 14.26 12.89 14.26C15.52 14.26 17.13 10.91 17.13 7.32C17.13 4.46 15.15 2.42 12.08 2.42C8.5 2.42 6.31 5.09 6.31 8.03C6.31 9.13 6.63 9.85 7.16 10.41C7.39 10.67 7.43 10.78 7.35 11.08L7.06 12.23C6.97 12.58 6.72 12.68 6.4 12.54C4.48 11.7 3.54 9.63 3.54 7.74C3.54 4.03 6.52 0.15 12.42 0.15C17.15 0.15 20.28 3.66 20.28 7.42C20.28 12.28 17.46 15.94 13.42 15.94C11.93 15.94 10.53 15.14 10.06 14.23L9.21 17.53C8.93 18.6 8.27 19.94 7.78 20.78C8.81 21.09 9.9 21.26 11.03 21.26" /></svg>
                    Pin it
                  </button>
                  <button onClick={() => { if (navigator.share) { navigator.share({ title: product.name, url: window.location.href }); } else { setShareMenuOpen(!shareMenuOpen); } }}
                    className="lsfps-share-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', padding: 0, transition: 'color 200ms ease' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Share
                  </button>
                </div>

                {/* Pairs well with */}
                {relatedProducts.length > 0 && <PairsWellWith products={relatedProducts} />}

                {/* Info links */}
                <div style={{ borderTop: '1px solid #e5e5e5', marginTop: '24px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '6px' }}>
                  <button onClick={() => setAskModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', color: '#222', fontWeight: 400 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Ask About This Product
                  </button>
                </div>

                {/* Accordion */}
                <div style={{ marginTop: '16px' }}>
                  <ProductInfoAccordion items={[
                    {
                      title: 'Description',
                      content: (
                        <>
                          <p style={{ marginBottom: '16px' }}>{product.description}</p>
                          <p style={{ marginBottom: '16px' }}>Our lipstain formula is enriched with hyaluronic acid and vitamin E, delivering rich, saturated colour that clings to lips without feathering or drying. Whether you prefer a bold matte finish or a glossy shine, each shade is designed to complement every skin tone beautifully.</p>
                          <p>Pair with our hydrating lip liner for a defined, long-lasting look that takes you from morning to midnight — no touch-ups needed.</p>
                        </>
                      ),
                    },
                    { title: 'Shipping and Returns', content: <p>Free shipping on orders over $50. Standard shipping takes 3–7 business days. Express shipping is available for an additional fee. 30-day hassle-free return policy on all unopened items in original packaging.</p> },
                    { title: 'Return Policies', content: <p>For hygiene reasons, opened lip products cannot be returned unless faulty. Sealed, unopened items may be returned within 30 days of delivery. Refunds are processed within 5–7 business days upon receipt of the returned item.</p> },
                  ]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ask About modal */}
      {askModalOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => setAskModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px', animation: 'lsfpsOverlayFadeIn 250ms ease' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', width: '100%', maxWidth: '480px', borderRadius: '8px', padding: '32px', margin: '0 16px', animation: 'lsfpsModalSlideDown 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#222' }}>Ask About This Product</h3>
              <button onClick={() => setAskModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {['Your Name', 'Your Email', 'Your Phone Number'].map((label) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px' }}>{label}</label>
                <input type={label.includes('Email') ? 'email' : label.includes('Phone') ? 'tel' : 'text'} className="lsfps-ask-input"
                  style={{ width: '100%', height: '44px', border: '1px solid #e5e5e5', borderRadius: '4px', padding: '0 14px', fontSize: '14px', color: '#222', outline: 'none', boxSizing: 'border-box', transition: 'border-color 200ms ease' }} />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px' }}>Message</label>
              <textarea className="lsfps-ask-input" style={{ width: '100%', height: '100px', border: '1px solid #e5e5e5', borderRadius: '4px', padding: '12px 14px', fontSize: '14px', color: '#222', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 200ms ease' }} />
            </div>
            <button style={{ width: '100%', padding: '14px', backgroundColor: ACCENT, color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 250ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a81030'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ACCENT; }}>
              Send Message
            </button>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .lsfps-outer { padding: 0; }
        .lsfps-section { padding-bottom: 80px; }

        .lsfps-heading-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 36px; flex-wrap: wrap;
        }
        .lsfps-heading {
          font-size: clamp(20px, 4vw, 28px); font-weight: 700; color: #111;
        }
        .lsfps-view-all {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: ${ACCENT};
          text-decoration: none; transition: gap 200ms ease;
        }
        .lsfps-view-all:hover { gap: 10px; }

        .lsfps-product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(24px, 3.6vw, 50px);
          align-items: start;
        }
        .lsfps-product-gallery-col {
          position: sticky; top: 110px; z-index: 10; min-width: 0;
        }
        .lsfps-product-info { position: relative; z-index: 1; min-width: 0; }

        .lsfps-gallery-flex { display: flex; gap: 16px; overflow: visible; }
        .lsfps-thumb-wrap { width: 90px; flex-shrink: 0; position: relative; }
        .lsfps-main-col { flex: 1; position: relative; overflow: visible; }
        .lsfps-thumb-arrow { display: none; }
        .lsfps-thumb-vertical::-webkit-scrollbar { width: 0; display: none; }
        .lsfps-thumb-vertical { scrollbar-width: none; }

        .lsfps-swiper-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 36px; height: 36px; border-radius: 0; border: 1px solid #e0e0e0;
          background: #fff; color: #222; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background-color 200ms ease, color 200ms ease, opacity 200ms ease;
        }
        .lsfps-swiper-arrow:hover { background: ${ACCENT}; color: #fff; border-color: ${ACCENT}; }
        .lsfps-swiper-arrow.swiper-button-disabled { opacity: 0.3; cursor: default; }
        .lsfps-swiper-prev { left: 16px; }
        .lsfps-swiper-next { right: 16px; }
        .lsfps-gallery-swiper, .lsfps-gallery-swiper .swiper-wrapper, .lsfps-gallery-swiper .swiper-slide {
          height: 100% !important;
        }

        .lsfps-btn-spinner {
          display: inline-block; border: 2px solid #ddd; border-top-color: currentColor;
          border-radius: 50%; animation: lsfpsSpinBtn 500ms linear infinite;
        }
        @keyframes lsfpsSpinBtn { to { transform: rotate(360deg); } }

        .lsfps-share-btn {
          text-decoration: underline !important; text-underline-offset: 3px !important;
          text-decoration-color: #ccc !important;
        }
        .lsfps-share-btn:hover { color: #222 !important; text-decoration-color: #222 !important; }

        @keyframes lsfpsLightboxIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lsfpsLightboxFade { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

        @keyframes lsfpsOverlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lsfpsModalSlideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        .lsfps-ask-input:focus { border-color: ${ACCENT} !important; }
        .lsfps-ask-input::placeholder { color: #aaa; }

        @media (max-width: 991px) {
          .lsfps-section { padding-bottom: clamp(40px, 8vw, 60px); }
          .lsfps-product-grid { grid-template-columns: 1fr; gap: clamp(20px, 5vw, 32px); }
          .lsfps-product-gallery-col { position: static; top: auto; z-index: auto; }
          .lsfps-gallery-flex { flex-direction: column-reverse; gap: 12px; min-width: 0; }
          .lsfps-thumb-wrap { width: 100%; min-width: 0; max-width: 100%; position: relative; }
          .lsfps-main-col { min-width: 0 !important; max-width: 100% !important; }
          .lsfps-thumb-vertical {
            flex-direction: row !important; max-height: none !important;
            overflow-x: auto !important; overflow-y: hidden !important;
            gap: 8px !important; padding: 0 32px !important; scroll-snap-type: x mandatory;
          }
          .lsfps-thumb-btn { width: clamp(64px, 14vw, 90px) !important; flex-shrink: 0 !important; scroll-snap-align: start; }
          .lsfps-thumb-arrow { display: flex; }
          .lsfps-thumb-arrow-prev {
            position: absolute; left: 0; top: 50%; transform: translateY(-50%); z-index: 2;
            width: 28px; height: 28px; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.9); border: 1px solid #e5e5e5; cursor: pointer;
            color: #222; border-radius: 2px;
          }
          .lsfps-thumb-arrow-next {
            position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 2;
            width: 28px; height: 28px; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.9); border: 1px solid #e5e5e5; cursor: pointer;
            color: #222; border-radius: 2px;
          }
          .lsfps-main-image-wrap { cursor: default !important; }
          .lsfps-zoom-lens, .lsfps-zoom-panel { display: none !important; }
          .lsfps-swiper-arrow { display: none !important; }
        }

        @media (max-width: 749px) {
          .lsfps-heading-row { margin-bottom: 24px; }
          .lsfps-info-title { font-size: clamp(22px, 5vw, 30px) !important; }
        }
      `}</style>
    </>
  );
}
