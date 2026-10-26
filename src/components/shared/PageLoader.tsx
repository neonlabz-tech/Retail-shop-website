'use client';

import { useEffect, useRef } from 'react';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export function PageLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dismiss = () => {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      setTimeout(() => { el.style.display = 'none'; }, 550);
    };

    // Fallback: force-dismiss after 6 s no matter what
    const timer = setTimeout(dismiss, 6_000);

    const ready = () => {
      clearTimeout(timer);
      // Brief delay lets the layout settle before revealing
      setTimeout(dismiss, 120);
    };

    if (document.readyState === 'complete') {
      ready();
    } else {
      window.addEventListener('load', ready, { once: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', ready);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(255, 255, 255, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div className="h-full w-full overflow-y-auto bg-white">
        <div className="flex h-[7.2rem] items-center border-b border-border px-[1.5rem] md:px-[4rem]">
          <Skeleton className="h-[2.4rem] w-[12rem]" />
          <div className="ml-auto flex gap-[1.2rem]">
            <Skeleton className="h-[1.6rem] w-[5rem]" />
            <Skeleton className="h-[1.6rem] w-[5rem]" />
            <Skeleton className="h-[1.6rem] w-[5rem]" />
          </div>
        </div>
        <PageSkeleton />
      </div>
    </div>
  );
}
