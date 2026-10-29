export interface ProductImage {
  id: string;
  src: string;
  alt: string;
}

export interface ColorOption {
  name: string;
  value: string;
  type: 'hex' | 'image';
}

export interface ProductVariant {
  id: string;
  name?: string;
  variantName?: string;
  color: string;
  size: string;
  label?: string;
  unit?: string;
  price: number;
  salePrice?: number | null;
  compareAtPrice: number | null;
  image: string;
  available: boolean;
  sku: string;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  colors: ColorOption[];
  sizes: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  brand: string;
  availability: 'in-stock' | 'out-of-stock' | 'pre-order';
  badge: 'sale' | 'new' | 'pre-order' | null;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  relatedProducts: string[];
  pairsWellWith: string[];
  createdAt: string;
  sku: string;
  countdownEnd: string | null;
  collections?: string[];
  stock?: number;
  lowStockThreshold?: number;
  salePrice?: number | null;
  weight?: number;
}
