'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/features/products/hooks/useProducts';

function IconChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
    </svg>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

function CountdownTimer() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Dynamic upcoming weekend deadline (Sunday 23:59:59) so the deal timer is always active and authentic
    const getTargetTime = () => {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7;
      target.setDate(now.getDate() + (daysUntilSunday === 0 ? 0 : daysUntilSunday));
      target.setHours(23, 59, 59, 999);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 7);
      }
      return target.getTime();
    };

    const target = getTargetTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pddb-countdown flex gap-[clamp(10px,1.6vw,16px)] min-[992px]:gap-[clamp(14px,2vw,22px)]">
      {[
        { val: pad(time.days), label: 'Days' },
        { val: pad(time.hours), label: 'Hrs' },
        { val: pad(time.minutes), label: 'Min' },
        { val: pad(time.seconds), label: 'Sec' },
      ].map(({ val, label }) => (
        <div
          key={label}
          className="pddb-cd-cell flex flex-col items-center justify-center bg-white/[0.08] backdrop-blur-[8px] border-[1.5px] border-white/[0.22] rounded-[8px] w-[clamp(60px,7vw,78px)] h-[clamp(60px,7vw,78px)] min-[992px]:w-[92px] min-[992px]:h-[92px] box-border shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
        >
          <span className="pddb-cd-val text-[clamp(20px,2.2vw,26px)] min-[992px]:text-[clamp(22px,2.4vw,26px)] font-bold text-white leading-none tabular-nums">
            {val}
          </span>
          <span className="pddb-cd-lbl text-[12px] text-[#cbd5e1] mt-[6px] font-medium">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PodDealBanner() {
  const { data } = useProducts({ limit: 12, sale: true, availability: 'in-stock' }, { endpoint: '/api/pod-products' });
  const allProducts = (data?.products && data.products.length > 0 ? data.products : [])
    .filter((p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0));

  // Filter and prioritize actual original products on sale
  const saleProducts = allProducts.filter(
    (p) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price)
  );

  const displaySource = (saleProducts.length > 0 ? saleProducts : allProducts).slice(0, 3);

  const displayProducts = displaySource
    .map((p, idx) => {
      const rawImg = p.images?.[0] as any;
      const image = typeof rawImg === 'string' ? rawImg : rawImg?.src || '';
      const discount = p.compareAtPrice && p.compareAtPrice > p.price
        ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
        : null;

      return {
        id: p.id || `prod-${idx}`,
        name: p.name,
        slug: p.slug,
        image,
        discount,
      };
    })
    .filter((p) => Boolean(p.image));

  return (
    <section>
      <div className="container-main">
        <div className="pddb-panel bg-[linear-gradient(135deg,#0b1c3d_0%,#112d62_55%,#183e84_100%)] rounded-[14px] py-[18px] px-[16px] min-[480px]:py-[22px] min-[480px]:px-[20px] shadow-[0_10px_30px_rgba(11,28,61,0.16)] min-[992px]:h-[190px] min-[992px]:flex min-[992px]:items-center min-[992px]:py-0 min-[992px]:px-[clamp(28px,3.4vw,48px)]">
          <div className="pddb-grid w-full flex flex-col items-center text-center gap-[clamp(20px,3vw,32px)] min-[992px]:flex-row min-[992px]:items-center min-[992px]:justify-between min-[992px]:text-left min-[992px]:gap-[clamp(28px,3.4vw,48px)]">
            <div className="pddb-left w-full flex flex-col items-center gap-[clamp(20px,3vw,32px)] min-[992px]:flex-row min-[992px]:items-center min-[992px]:w-auto min-[992px]:gap-[clamp(20px,2.4vw,32px)]">
              <div className="pddb-thumbs grid grid-cols-3 w-full gap-[10px] min-[480px]:gap-[14px] min-[992px]:flex min-[992px]:w-auto min-[992px]:gap-[16px]">
                {displayProducts.map((prod, i) => (
                  <Link
                    key={prod.slug + i}
                    href={`/products/${prod.slug}`}
                    className="pddb-thumb relative block w-full aspect-square min-[992px]:w-[110px] min-[992px]:h-[110px] min-[992px]:shrink-0 min-[992px]:p-0 bg-white rounded-[10px] overflow-hidden box-border shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_8px_22px_rgba(0,0,0,0.28)]"
                    title={prod.name}
                  >
                    {Boolean(prod.discount && prod.discount > 0) && (
                      <span className="absolute top-[5px] right-[5px] z-10 bg-[#e01117] text-white text-[10px] min-[480px]:text-[11px] font-bold px-[5px] py-[2px] rounded-[4px] shadow-sm leading-none pointer-events-none">
                        -{prod.discount}%
                      </span>
                    )}
                    <Image
                      src={prod.image}
                      alt={prod.name || `Deal product ${i + 1}`}
                      fill
                      className="object-contain p-[6px]"
                      sizes="(max-width: 991px) 33vw, 110px"
                    />
                  </Link>
                ))}
              </div>

              <div className="pddb-text flex flex-col items-center min-[992px]:items-start gap-[6px]">
                <p className="pddb-label text-[clamp(13px,1.2vw,14px)] min-[992px]:text-[clamp(12px,1.1vw,13px)] font-semibold text-[#93c5fd] uppercase tracking-[0.8px]">
                  Special Weekend Deal
                </p>
                <p className="pddb-heading text-[clamp(20px,2.2vw,26px)] min-[992px]:text-[clamp(21px,2.3vw,26px)] font-bold text-white leading-[1.2]">
                  Save an Extra Discount!
                </p>
                <Link
                  href="/shop"
                  className="pddb-link inline-flex items-center gap-[6px] text-[clamp(13px,1.2vw,14px)] font-semibold text-white bg-white/[0.12] px-[18px] py-[8px] rounded-full border border-white/[0.24] no-underline mt-[4px] transition-all duration-200 hover:bg-white hover:text-[#0b1c3d]"
                >
                  Shop Now
                  <IconChevronRight size={16} />
                </Link>
              </div>
            </div>

            <CountdownTimer />
          </div>
        </div>
      </div>
    </section>
  );
}
