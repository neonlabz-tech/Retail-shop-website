'use client';

import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { HeaderActions } from './HeaderActions';
import { MobileNav } from './MobileNav';
import { HeaderCategoriesButton } from './HeaderCategoriesButton';
import { useUIStore } from '@/store/uiStore';
import { useSmartHeader } from '@/hooks/useSmartHeader';
import { IconMenu } from '@/lib/icons';

export function Header() {
  const { openMobileMenu } = useUIStore();
  const { isVisible, isScrolled } = useSmartHeader();

  return (
    <>
      <header
        className={`main-header sticky top-0 z-[200] bg-white h-[90px] max-[715px]:!h-[72px] overflow-visible border-b border-[#e5e5e5] min-[992px]:!sticky min-[992px]:!top-0 min-[992px]:!z-[200] min-[992px]:will-change-transform will-change-transform transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : ''}`}
      >
        <div className="container-main h-full grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-[12px] justify-self-start">
            <button
              onClick={openMobileMenu}
              aria-label="Open menu"
              className="mobile-menu-btn hidden max-[715px]:!flex items-center justify-center text-[#222] cursor-pointer bg-transparent border-none p-0"
            >
              <IconMenu />
            </button>

            <div className="fashion-logo-desktop max-[715px]:!hidden">
              <Logo />
            </div>

            <div className="fashion-header-categories-desktop max-[991px]:!hidden">
              <HeaderCategoriesButton />
            </div>
          </div>

          <div className="desktop-nav-wrapper max-[715px]:!hidden">
            <DesktopNav />
          </div>

          <div className="fashion-logo-mobile hidden max-[715px]:flex max-[715px]:justify-center max-[715px]:items-center max-[715px]:[&_img]:!h-[50px]">
            <Logo />
          </div>

          <div className="flex items-center gap-[22px] justify-self-end">
            <HeaderActions />
          </div>
        </div>
      </header>

      <MobileNav />
    </>
  );
}
