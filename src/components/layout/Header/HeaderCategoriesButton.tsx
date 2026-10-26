'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { CategoriesCascadingMenu } from './CategoriesCascadingMenu';
import { IconHamburger } from '@/lib/icons';

export function HeaderCategoriesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Close on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-close on scroll (mobile & desktop)
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // Auto-close on click or tap outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = useCallback(() => {
    // Only open on hover on devices that support hover (e.g. mouse cursor)
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  }, []);

  const handleClick = () => {
    // Allows tap/click to toggle on mobile/touch, and click to toggle on desktop
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="header-categories-btn-container relative inline-flex items-center ml-[12px]"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="All Categories Menu"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-[8px] px-[14px] py-[8px] border-[1.5px] rounded-[6px] text-[14px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap leading-none ${
          isOpen
            ? 'bg-[#111] text-white border-[#222]'
            : 'bg-white text-[#111] border-[#222] hover:bg-[#f8f8f8] hover:border-[#F15B41] hover:text-[#F15B41]'
        }`}
      >
        <IconHamburger size={17} />
        <span className="header-categories-text">All Categories</span>
      </button>

      {isOpen && (
        <CategoriesCascadingMenu
          align="left"
          onClose={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default HeaderCategoriesButton;
