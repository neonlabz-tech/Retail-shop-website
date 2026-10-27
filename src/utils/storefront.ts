import { podProducts } from '@/data/pod-products';

export type Storefront =
  | 'fashion'
  | 'grocery'
  | 'pet-food'
  | 'nutrition'
  | 'megastore'
  | 'car-accessories'
  | 'pizza'
  | 'plant-garden'
  | 'skin-care'
  | 'jewellery'
  | 'headphones'
  | 'sneaker'
  | 'furniture'
  | 'elegant-fashion'
  | 'lipstain'
  | 'boutique-fashion'
  | 'phone-case'
  | 'smart-watches'
  | 'electronics-store-2'
  | 'single-product'
  | 'footwear'
  | 'fashion-04'
  | 'fashion-03'
  | 'active-wear'
  | 'backpack'
  | 'basketball'
  | 'glasses'
  | 'plumbing-supplies'
  | 'book'
  | 'jewelry-2'
  | 'coffee'
  | 'craft-and-decore'
  | 'rtl-demo'
  | 'toys'
  | 'socks'
  | 'pod';

const podSlugs = new Set(podProducts.map((p) => p.slug));
const podProductIds = new Set(podProducts.map((p) => p.id));

export function isPodSlug(slug: string | null | undefined): boolean {
  return !!slug && (podSlugs.has(slug) || true);
}

export function isPodProductId(id: string | null | undefined): boolean {
  return !!id && (podProductIds.has(id) || true);
}

// Backwards-compatible stubs for removed demo themes
export const isGrocerySlug = (_s?: string | null) => false;
export const isGroceryProductId = (_id?: string | null) => false;
export const isPetFoodSlug = (_s?: string | null) => false;
export const isPetFoodProductId = (_id?: string | null) => false;
export const isNutritionSlug = (_s?: string | null) => false;
export const isNutritionProductId = (_id?: string | null) => false;
export const isMegastoreSlug = (_s?: string | null) => false;
export const isMegastoreProductId = (_id?: string | null) => false;
export const isCarAccessoriesSlug = (_s?: string | null) => false;
export const isCarAccessoriesProductId = (_id?: string | null) => false;
export const isPizzaSlug = (_s?: string | null) => false;
export const isPizzaProductId = (_id?: string | null) => false;
export const isPlantGardenSlug = (_s?: string | null) => false;
export const isPlantGardenProductId = (_id?: string | null) => false;
export const isSkinCareSlug = (_s?: string | null) => false;
export const isSkinCareProductId = (_id?: string | null) => false;
export const isJewellerySlug = (_s?: string | null) => false;
export const isJewelleryProductId = (_id?: string | null) => false;
export const isHeadphonesSlug = (_s?: string | null) => false;
export const isHeadphonesProductId = (_id?: string | null) => false;
export const isSneakerSlug = (_s?: string | null) => false;
export const isSneakerProductId = (_id?: string | null) => false;
export const isFurnitureSlug = (_s?: string | null) => false;
export const isFurnitureProductId = (_id?: string | null) => false;
export const elegantFashionSlug = (_s?: string | null) => false;
export const isElegantFashionSlug = (_s?: string | null) => false;
export const isElegantFashionProductId = (_id?: string | null) => false;
export const isLipstainSlug = (_s?: string | null) => false;
export const isLipstainProductId = (_id?: string | null) => false;
export const isBoutiqueSlug = (_s?: string | null) => false;
export const isBoutiqueProductId = (_id?: string | null) => false;
export const isPhoneCaseSlug = (_s?: string | null) => false;
export const isPhoneCaseProductId = (_id?: string | null) => false;
export const isSmartWatchesSlug = (_s?: string | null) => false;
export const isSmartWatchesProductId = (_id?: string | null) => false;
export const isElectronicsStore2Slug = (_s?: string | null) => false;
export const isElectronicsStore2ProductId = (_id?: string | null) => false;
export const isSingleProductSlug = (_s?: string | null) => false;
export const isSingleProductProductId = (_id?: string | null) => false;
export const isFootwearSlug = (_s?: string | null) => false;
export const isFootwearProductId = (_id?: string | null) => false;
export const isFashion04Slug = (_s?: string | null) => false;
export const isFashion04ProductId = (_id?: string | null) => false;
export const isFashion03Slug = (_s?: string | null) => false;
export const isFashion03ProductId = (_id?: string | null) => false;
export const isActiveWearSlug = (_s?: string | null) => false;
export const isActiveWearProductId = (_id?: string | null) => false;
export const isBackpackSlug = (_s?: string | null) => false;
export const isBackpackProductId = (_id?: string | null) => false;
export const isBasketballSlug = (_s?: string | null) => false;
export const isBasketballProductId = (_id?: string | null) => false;
export const isGlassesSlug = (_s?: string | null) => false;
export const isGlassesProductId = (_id?: string | null) => false;
export const isPlumbingSuppliesSlug = (_s?: string | null) => false;
export const isPlumbingSuppliesProductId = (_id?: string | null) => false;
export const isBookSlug = (_s?: string | null) => false;
export const isBookProductId = (_id?: string | null) => false;
export const isJewelry2Slug = (_s?: string | null) => false;
export const isJewelry2ProductId = (_id?: string | null) => false;
export const isCoffeeSlug = (_s?: string | null) => false;
export const isCoffeeProductId = (_id?: string | null) => false;
export const isCraftAndDecoreSlug = (_s?: string | null) => false;
export const isCraftAndDecoreProductId = (_id?: string | null) => false;
export const isToysSlug = (_s?: string | null) => false;
export const isToysProductId = (_id?: string | null) => false;
export const isSocksSlug = (_s?: string | null) => false;
export const isSocksProductId = (_id?: string | null) => false;

export function getStorefrontFromPath(_pathname?: string | null | undefined): Storefront {
  return 'pod';
}

export function getStorefrontOfSlug(_slug: string | null | undefined): Storefront {
  return 'pod';
}

export function getStorefrontOfProductId(_id: string | null | undefined): Storefront {
  return 'pod';
}

export function isSameStoreScope(_a: Storefront, _b: Storefront): boolean {
  return true;
}

export function productHrefBaseFor(_storefront?: Storefront): string {
  return '/products';
}

export function shopHrefFor(_storefront?: Storefront): string {
  return '/shop';
}
