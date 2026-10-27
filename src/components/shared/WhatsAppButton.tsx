'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function IconWhatsApp({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // You can enter your number starting with 0 (e.g. '0789915587') or international format ('94789915587')
  const phoneNumber = '0789915587';
  const formattedPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '94');
  const defaultMessage = 'Hello! I am browsing your store and would like to inquire about your products.';
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultMessage)}`;

  // Custom dragged coordinates (null = default responsive bottom-right position)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLAnchorElement>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    origLeft: number;
    origTop: number;
    hasMoved: boolean;
  } | null>(null);
  const justDraggedRef = useRef(false);

  // Handle window resizing if the user has already dragged the button
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => {
        if (!prev) return null;
        const el = containerRef.current;
        const w = el?.offsetWidth || 52;
        const h = el?.offsetHeight || 52;
        const maxX = window.innerWidth - w - 10;
        const maxY = window.innerHeight - h - 10;
        return {
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y)),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag event handlers (works for both touch & mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.button !== 0) return;

    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
      hasMoved: false,
    };

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const start = dragStartRef.current;
    if (!start) return;

    const dx = e.clientX - start.startX;
    const dy = e.clientY - start.startY;

    // Movement threshold (5px) distinguishes tap/click from drag
    if (!start.hasMoved && Math.hypot(dx, dy) > 5) {
      start.hasMoved = true;
      setIsDragging(true);
    }

    if (start.hasMoved) {
      const el = containerRef.current;
      const w = el?.offsetWidth || 52;
      const h = el?.offsetHeight || 52;

      const maxX = window.innerWidth - w - 10;
      const maxY = window.innerHeight - h - 10;

      const newX = Math.max(10, Math.min(maxX, start.origLeft + dx));
      const newY = Math.max(10, Math.min(maxY, start.origTop + dy));

      setPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const start = dragStartRef.current;
    if (!start) return;

    const el = containerRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }

    if (start.hasMoved) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 150);
    }

    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Suppress opening link if the user dragged the widget
    if (justDraggedRef.current || isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Flip pill orientation if dragged to the left half of the screen
  const isLeftHalf = pos !== null && typeof window !== 'undefined' && pos.x < window.innerWidth / 2;

  // Build inline styles
  const widgetStyle: React.CSSProperties = pos
    ? {
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        bottom: 'auto',
        right: 'auto',
        flexDirection: isLeftHalf ? 'row-reverse' : 'row',
        zIndex: 145,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'scale(1.06)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 200ms ease, box-shadow 200ms ease',
      }
    : {
        position: 'fixed',
        zIndex: 145,
        cursor: isDragging ? 'grabbing' : 'grab',
      };

  return (
    <>
      <a
        ref={containerRef}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`wa-widget ${pos ? 'wa-widget-dragged' : ''} ${isDragging ? 'wa-widget-dragging' : ''}`}
        style={widgetStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        aria-label="Chat with us on WhatsApp"
      >
        <div className="wa-pill">
          <span className="wa-status-dot" />
          <span className="wa-pill-text">Chat with us</span>
        </div>
        <div className="wa-btn">
          <IconWhatsApp size={28} />
        </div>
      </a>

      <style>{`
        .wa-widget {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        /* Default non-dragged placement on Desktop */
        .wa-widget:not(.wa-widget-dragged) {
          bottom: 28px;
          right: 28px;
          transition: bottom 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms ease, filter 250ms ease;
        }

        .wa-widget:not(.wa-widget-dragged):hover {
          transform: translateY(-2px);
        }

        .wa-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #1f2937;
          padding: 8px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          white-space: nowrap;
          pointer-events: none;
          transition: box-shadow 250ms ease;
        }

        .wa-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #25d366;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.25);
          animation: wa-pulse 2s infinite;
        }

        @keyframes wa-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }

        .wa-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #25d366;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35), 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: transform 250ms ease, box-shadow 250ms ease, background-color 200ms ease;
          pointer-events: none;
        }

        .wa-widget:not(.wa-widget-dragging):hover .wa-btn {
          background: #20ba5a;
          box-shadow: 0 8px 22px rgba(37, 211, 102, 0.45), 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .wa-widget:not(.wa-widget-dragging):hover .wa-pill {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
        }

        .wa-widget-dragging .wa-btn {
          box-shadow: 0 12px 30px rgba(37, 211, 102, 0.55), 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        /* Mobile ≤ 749px: keep the widget above MobileBottomNav */
        @media (max-width: 749px) {
          .wa-widget:not(.wa-widget-dragged) {
            bottom: 82px;
            right: 16px;
          }
          .wa-pill {
            display: none;
          }
          .wa-btn {
            width: 48px;
            height: 48px;
          }
        }

        /* Hide when drawer or modal is open */
        body.scroll-locked .wa-widget {
          display: none !important;
        }
      `}</style>
    </>
  );
}
