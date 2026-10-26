'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';

interface UseSmartHeaderOptions {
  threshold?: number;
  topThreshold?: number;
}

export function useSmartHeader(options: UseSmartHeaderOptions = {}) {
  const { threshold = 10, topThreshold = 80 } = options;
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  const searchOpen = useUIStore((s) => s.searchOpen);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);

  // Always show on page/route change
  useEffect(() => {
    setIsVisible(true);
    setIsScrolled(false);
    lastScrollY.current = 0;
  }, [pathname]);

  useEffect(() => {
    // If any drawer/modal is open, keep the header visible
    if (searchOpen || mobileMenuOpen || isDrawerOpen) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Ignore negative scroll values (e.g., iOS rubber-band at top)
      if (currentScrollY < 0) return;

      // Prevent iOS bounce at the bottom from triggering false scroll-up
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY > maxScroll - 30) return;

      // Near top of page: always keep visible
      if (currentScrollY <= topThreshold) {
        setIsVisible(true);
        setIsScrolled(currentScrollY > 10);
        lastScrollY.current = currentScrollY;
        return;
      }

      setIsScrolled(true);

      const diff = currentScrollY - lastScrollY.current;

      // Scroll Down past threshold -> Hide
      if (diff > threshold) {
        setIsVisible(false);
        lastScrollY.current = currentScrollY;
      }
      // Scroll Up past threshold -> Show
      else if (diff < -threshold) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [searchOpen, mobileMenuOpen, isDrawerOpen, threshold, topThreshold]);

  return { isVisible, isScrolled };
}
