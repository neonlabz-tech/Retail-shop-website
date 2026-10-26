'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { HeaderActions } from './HeaderActions';
import { MobileNav } from './MobileNav';
import { HeaderCategoriesButton } from './HeaderCategoriesButton';
import { GroceryHeader } from './GroceryHeader';
import { PetFoodHeader } from './PetFoodHeader';
import { NutritionHeader } from './NutritionHeader';
import { MegastoreHeader } from './MegastoreHeader';
import { CarAccessoriesHeader } from './CarAccessoriesHeader';
import { PizzaShopHeader } from './PizzaShopHeader';
import { PlantGardenHeader } from './PlantGardenHeader';
import { SkinCareHeader } from './SkinCareHeader';
import { JewelleryHeader } from './JewelleryHeader';
import { HeadphonesHeader } from './HeadphonesHeader';
import { SneakerHeader } from './SneakerHeader';
import { FurnitureHeader } from './FurnitureHeader';
import { ElegantFashionHeader } from './ElegantFashionHeader';
import { LipstainHeader } from './LipstainHeader';
import { BoutiqueFashionHeader } from './BoutiqueFashionHeader';
import { PhoneCaseHeader } from './PhoneCaseHeader';
import { SmartWatchesHeader } from './SmartWatchesHeader';
import { SingleProductHeader } from './SingleProductHeader';
import { FootwearHeader } from './FootwearHeader';
import { Fashion04Header } from './Fashion04Header';
import { Fashion03Header } from './Fashion03Header';
import { ActiveWearHeader } from './ActiveWearHeader';
import { BackpackHeader } from './BackpackHeader';
import { BasketballHeader } from './BasketballHeader';
import { GlassesHeader } from './GlassesHeader';
import { PlumbingSuppliesHeader } from './PlumbingSuppliesHeader';
import { BookHeader } from './BookHeader';
import { Jewelry2Header } from './Jewelry2Header';
import { CoffeeHeader } from './CoffeeHeader';
import { CraftDecoreHeader } from './CraftDecoreHeader';
import { RtlDemoHeader } from './RtlDemoHeader';
import { ToysHeader } from './ToysHeader';
import { SocksHeader } from './SocksHeader';
import { PodHeader } from './PodHeader';
import { useUIStore } from '@/store/uiStore';
import { useSmartHeader } from '@/hooks/useSmartHeader';
import { IconMenu } from '@/lib/icons';

export function Header() {
  const pathname = usePathname();
  const { openMobileMenu } = useUIStore();
  const { isVisible, isScrolled } = useSmartHeader();

  if (
    pathname?.startsWith('/home/nutrition-shop') ||
    pathname?.startsWith('/nutrition/')
  ) {
    return <NutritionHeader />;
  }

  if (
    pathname?.startsWith('/home/pet-food-shop') ||
    pathname?.startsWith('/pet-food/')
  ) {
    return <PetFoodHeader />;
  }

  if (
    pathname?.startsWith('/home/grocery-shop') ||
    pathname?.startsWith('/grocery/')
  ) {
    return <GroceryHeader />;
  }

  if (
    pathname?.startsWith('/home/megastore-shop') ||
    pathname?.startsWith('/megastore/')
  ) {
    return <MegastoreHeader />;
  }

  if (
    pathname?.startsWith('/home/car-accessories-shop') ||
    pathname?.startsWith('/car-accessories/')
  ) {
    return <CarAccessoriesHeader />;
  }

  if (
    pathname?.startsWith('/home/pizza-shop') ||
    pathname?.startsWith('/pizza/')
  ) {
    return <PizzaShopHeader />;
  }

  if (
    pathname?.startsWith('/home/plant-garden-shop') ||
    pathname?.startsWith('/plant-garden/')
  ) {
    return <PlantGardenHeader />;
  }

  if (pathname?.startsWith('/home/skin-care-shop')) {
    return <SkinCareHeader />;
  }

  if (
    pathname?.startsWith('/home/jewellery-shop') ||
    pathname?.startsWith('/jewellery/')
  ) {
    return <JewelleryHeader />;
  }

  if (
    pathname?.startsWith('/home/headphones-shop') ||
    pathname?.startsWith('/headphones/')
  ) {
    return <HeadphonesHeader />;
  }

  if (pathname?.startsWith('/home/sneaker-shop')) {
    return <SneakerHeader />;
  }

  if (pathname?.startsWith('/home/furniture-shop')) {
    return <FurnitureHeader />;
  }

  if (pathname?.startsWith('/home/elegant-fashion-shop')) {
    return <ElegantFashionHeader />;
  }

  if (pathname?.startsWith('/home/lipstain-shop')) {
    return <LipstainHeader />;
  }

  if (
    pathname?.startsWith('/home/boutique-fashion-shop') ||
    pathname?.startsWith('/boutique-fashion/')
  ) {
    return <BoutiqueFashionHeader />;
  }

  if (
    pathname?.startsWith('/home/phone-case-shop') ||
    pathname?.startsWith('/phone-case/')
  ) {
    return <PhoneCaseHeader />;
  }

  if (
    pathname?.startsWith('/home/smart-watches-shop') ||
    pathname?.startsWith('/smart-watches/')
  ) {
    return <SmartWatchesHeader />;
  }

  if (pathname?.startsWith('/home/single-product-shop')) {
    return <SingleProductHeader />;
  }

  if (
    pathname?.startsWith('/home/footwear-shop') ||
    pathname?.startsWith('/footwear/')
  ) {
    return <FootwearHeader />;
  }

  if (pathname?.startsWith('/home/fashion-04-shop')) {
    return <Fashion04Header />;
  }

  if (pathname?.startsWith('/home/fashion-03-shop')) {
    return <Fashion03Header />;
  }

  if (pathname?.startsWith('/home/active-wear-shop')) {
    return <ActiveWearHeader />;
  }

  if (pathname?.startsWith('/home/backpack-shop')) {
    return <BackpackHeader />;
  }

  if (pathname?.startsWith('/home/basketball-shop')) {
    return <BasketballHeader />;
  }

  if (pathname?.startsWith('/home/glasses-shop')) {
    return <GlassesHeader />;
  }

  if (pathname?.startsWith('/home/plumbing-supplies-shop')) {
    return <PlumbingSuppliesHeader />;
  }

  if (pathname?.startsWith('/home/book-shop')) {
    return <BookHeader />;
  }

  if (pathname?.startsWith('/home/jewelry-2-shop')) {
    return <Jewelry2Header />;
  }

  if (pathname?.startsWith('/home/coffee-shop')) {
    return <CoffeeHeader />;
  }

  if (pathname?.startsWith('/home/craft-and-decore-shop')) {
    return <CraftDecoreHeader />;
  }

  if (pathname?.startsWith('/home/rtl-demo-shop')) {
    return <RtlDemoHeader />;
  }

  if (pathname?.startsWith('/home/toys-shop')) {
    return <ToysHeader />;
  }

  if (pathname?.startsWith('/home/socks-shop')) {
    return <SocksHeader />;
  }

  if (pathname?.startsWith('/home/pod-shop')) {
    return <PodHeader />;
  }

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
