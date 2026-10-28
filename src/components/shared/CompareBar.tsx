'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/store/compareStore';
import { getStorefrontFromPath, getStorefrontOfProductId } from '@/utils/storefront';
import { FALLBACK_IMAGE_SRC, handleImageError, normalizeImageSrc } from '@/lib/imageFallback';

function comparePathForStorefront(_pathname: string | null): string {
  return '/compare';
}

function IconClose() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
      <path d="M8.48627 9.32917L2.82849 3.67098" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.88539 9.38504L8.42932 3.61524" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCloseLg() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="currentColor">
      <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" />
    </svg>
  );
}

export function CompareBar() {
  const pathname = usePathname();
  const storefront = getStorefrontFromPath(pathname);
  const storefrontRef = useRef(storefront);
  useEffect(() => { storefrontRef.current = storefront; }, [storefront]);

  const [visible, setVisible] = useState(false);
  const [, setDismissed] = useState(false);
  const [compareItems, setCompareItems] = useState<ReturnType<typeof useCompareStore.getState>['items']>([]);
  const barRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(
    () => compareItems.filter((p) => getStorefrontOfProductId(p.id) === storefront),
    [compareItems, storefront]
  );

  useEffect(() => {
    setCompareItems(useCompareStore.getState().items);

    const unsub = useCompareStore.subscribe((state) => {
      const newItems = state.items;
      setCompareItems(newItems);
      const sf = storefrontRef.current;
      const forStorefront = newItems.filter((p) => getStorefrontOfProductId(p.id) === sf);
      if (forStorefront.length > 0) {
        setDismissed(false);
        setVisible(true);
      } else {
        setVisible(false);
        setDismissed(false);
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (visibleItems.length === 0) {
      setVisible(false);
    }
  }, [visibleItems.length]);

  const handleRemove = useCallback((id: string) => {
    useCompareStore.getState().removeItem(id);
  }, []);

  const handleClearAll = useCallback(() => {
    const sf = storefrontRef.current;
    const all = useCompareStore.getState().items;
    all
      .filter((p) => getStorefrontOfProductId(p.id) === sf)
      .forEach((p) => useCompareStore.getState().removeItem(p.id));
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
  }, []);

  // Push body down so the footer is never hidden behind the fixed bar.
  // At ≤749px we also include the 70px MobileBottomNav that CSS already adds,
  // because the inline style overrides the CSS rule.
  useEffect(() => {
    const el = barRef.current;
    function apply() {
      if (!visible || !el) {
        document.body.style.paddingBottom = '';
        return;
      }
      const barH = el.offsetHeight;
      const isMobile = window.innerWidth <= 749;
      document.body.style.paddingBottom = `${barH + (isMobile ? 70 : 0)}px`;
    }
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.body.style.paddingBottom = '';
    };
  }, [visible, visibleItems.length]);

  return (
    <>
      <div
        ref={barRef}
        className="cb-bar"
        style={{
          transition: 'transform 400ms ease, opacity 300ms ease',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* Close button — position:absolute on the bar, anchored top-right */}
        <button
          onClick={handleDismiss}
          className="cb-close"
          aria-label="Close compare bar"
        >
          <IconCloseLg />
        </button>

        {/* All content inside container */}
        <div className="container-main cb-inner">

          {/* Title */}
          <h3 className="cb-title">Compare Products</h3>

          {/* Product thumbnails */}
          <div className="cb-thumbs">
            {visibleItems.map((product) => (
              <div key={product.id} className="cb-thumb">
                <div className="cb-thumb-img">
                  <Image
                    src={normalizeImageSrc(product.images[0]?.src) || FALLBACK_IMAGE_SRC}
                    alt={product.name}
                    fill
                    onError={handleImageError}
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 991px) 95px, 130px"
                  />
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="cb-remove"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#222'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#222'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#ddd'; }}
                >
                  <IconClose />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="cb-actions">
            <Link
              href={comparePathForStorefront(pathname)}
              className="cb-compare-btn"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F15B41'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000'; }}
            >
              Compare
            </Link>
            <button onClick={handleClearAll} className="cb-clear-btn">
              Clear All
            </button>
          </div>

        </div>
      </div>

      <style>{`
        /* ─── base ─── */
        .cb-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 250px;
          background-color: #fff;
          border-top: 1px solid #e5e5e5;
          z-index: 900;
        }

        .cb-close {
          position: absolute;
          top: 40px; right: 40px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          color: #222; padding: 4px; z-index: 2;
        }

        .cb-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .cb-title {
          font-size: 28px;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cb-thumbs {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          justify-content: flex-start;
        }

        .cb-thumb {
          position: relative;
          flex-shrink: 0;
        }

        .cb-thumb-img {
          width: 130px;
          height: 170px;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          background-color: #f5f5f5;
        }

        .cb-remove {
          position: absolute;
          top: -8px; right: -8px;
          width: 24px; height: 24px;
          border-radius: 50%;
          background-color: #fff;
          border: 1px solid #ddd;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #555; z-index: 2;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: all 200ms ease;
        }

        .cb-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .cb-compare-btn {
          display: inline-block;
          padding: 14px 36px;
          background-color: #000;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: background-color 250ms ease;
        }

        .cb-clear-btn {
          font-size: 14px;
          color: #222;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
        }

        /* ─── 1200px → 992px: fluid reduction, side-by-side maintained ─── */
        @media (max-width: 1199px) {
          .cb-bar    { height: clamp(200px, 22vw, 250px); }
          .cb-close  { top: clamp(24px, 2.8vw, 40px); right: clamp(24px, 2.8vw, 40px); }
          .cb-inner  { gap: clamp(20px, 2.5vw, 30px); }
          .cb-title  { font-size: clamp(20px, 2.4vw, 28px) !important; }
          .cb-thumb-img {
            width:  clamp(90px, 11vw, 130px) !important;
            height: clamp(115px, 14vw, 170px) !important;
          }
          .cb-thumbs      { gap: clamp(10px, 1.4vw, 16px) !important; }
          .cb-compare-btn {
            padding:   clamp(11px, 1.2vw, 14px) clamp(24px, 3vw, 36px) !important;
            font-size: clamp(13px, 1.4vw, 16px) !important;
          }
          .cb-clear-btn { font-size: clamp(12px, 1.2vw, 14px) !important; }
        }

        /* ─── ≤991px: stacked column, centered ─── */
        @media (max-width: 991px) {
          .cb-bar {
            height: auto !important;
          }
          .cb-close {
            top: 18px !important;
            right: clamp(1.5rem, 4vw, 4rem) !important;
          }
          .cb-inner {
            height: auto !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding-block: 20px 24px !important;
            gap: 16px !important;
          }
          .cb-title {
            font-size: clamp(16px, 4.5vw, 22px) !important;
            white-space: normal !important;
            text-align: center;
            flex-shrink: unset !important;
            width: 100%;
            padding-right: 40px;
            box-sizing: border-box;
          }
          .cb-thumbs {
            flex: unset !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: clamp(8px, 2.5vw, 12px) !important;
          }
          .cb-thumb-img {
            width:  clamp(65px, 18vw, 95px) !important;
            height: clamp(80px, 22vw, 120px) !important;
          }
          .cb-actions {
            width: 100% !important;
            align-items: center !important;
            flex-shrink: unset !important;
            gap: 12px !important;
          }
          .cb-compare-btn {
            display: block !important;
            width: min(260px, 80%) !important;
            text-align: center !important;
            padding: clamp(10px, 2.5vw, 12px) 20px !important;
            font-size: clamp(13px, 3.5vw, 15px) !important;
          }
          .cb-clear-btn { font-size: clamp(12px, 3.5vw, 14px) !important; }
        }

        /* ─── ≤749px: sit above the 70px MobileBottomNav ─── */
        @media (max-width: 749px) {
          .cb-bar { bottom: 70px !important; }
        }
      `}</style>
    </>
  );
}
