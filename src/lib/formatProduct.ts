import type { Product } from '@/types/product';
import { parseWeightInGrams } from '@/utils/weight';
import { FALLBACK_IMAGE_SRC, normalizeImageSrc } from '@/lib/imageFallback';

const CATEGORY_ID_MAP: Record<string, string> = {
  '6ad5f26d8c37efc3ddcb1a03': 'Toys & Games',
  '6ad5f2708c37efc3ddcb1a08': 'Party & Celebrations',
  '6ad5f2738c37efc3ddcb1a0b': 'Home & Living',
  '6ad5f2758c37efc3ddcb1a0f': 'Stationery & School',
  '6ad5f2788c37efc3ddcb1a11': 'Electronics & Gadgets',
  '6ad5f27a8c37efc3ddcb1a13': 'Fashion & Accessories',
};

const SUBCATEGORY_TO_CATEGORY: Record<string, string> = {
  'Action & Toy Vehicles': 'Toys & Games',
  'Outdoor & Bubble Play': 'Toys & Games',
  'Figures & Collectibles': 'Toys & Games',
  'Kids Activities & Games': 'Toys & Games',
  'Party Supplies & Effects': 'Party & Celebrations',
  'Cake Accessories': 'Party & Celebrations',
  'Dining & Tableware': 'Home & Living',
  'Furniture & Storage': 'Home & Living',
  'Clocks & Home Decor': 'Home & Living',
  'Kids Stationery Sets': 'Stationery & School',
  'Fans & Cooling': 'Electronics & Gadgets',
  'Jewelry & Accessories': 'Fashion & Accessories',
};

function resolveCategory(doc: any): string {
  if (typeof doc.category === 'object' && doc.category && doc.category.name) {
    return doc.category.name;
  }
  const catId = doc.category?.toString?.() || (typeof doc.category === 'string' ? doc.category : '');
  if (catId && CATEGORY_ID_MAP[catId]) {
    return CATEGORY_ID_MAP[catId];
  }
  if (doc.subcategory && SUBCATEGORY_TO_CATEGORY[doc.subcategory]) {
    return SUBCATEGORY_TO_CATEGORY[doc.subcategory];
  }
  if (typeof doc.category === 'string' && doc.category.length > 0 && !/^[0-9a-fA-F]{24}$/.test(doc.category)) {
    return doc.category;
  }
  return doc.subcategory || 'General';
}

export function formatMongoProduct(doc: any): Product {
  const rawImages: unknown[] = Array.isArray(doc.images) ? doc.images : [];
  const images = rawImages
    .map((image, index) => {
      const src = normalizeImageSrc(image);
      return src
        ? {
            id: `img-${index}`,
            src,
            alt: doc.name || 'Product Image',
          }
        : null;
    })
    .filter((image): image is NonNullable<typeof image> => image !== null);

  if (images.length === 0) {
    images.push({
      id: 'img-placeholder',
      src: FALLBACK_IMAGE_SRC,
      alt: doc.name || 'Product Image',
    });
  }

  const inStock = (doc.stock ?? 0) > 0;
  const isSale = doc.salePrice && doc.salePrice > 0 && doc.salePrice < doc.price;

  const productId = doc._id?.toString() || doc.id || '';
  const finalPrice = isSale ? doc.salePrice : (doc.price ?? 0);
  const compareAtPrice = isSale ? doc.price : null;

  // ── Parse Mongo Variants (supporting name, price, salePrice, stock, lowStockThreshold) ──
  const rawVariants: any[] = Array.isArray(doc.variants) && doc.variants.length > 0 ? doc.variants : [];
  let mappedVariants: any[] = [];
  const extractedSizes: string[] = [];
  const extractedColors: Array<{ name: string; value: string; type: 'hex' | 'image' }> = [];

  if (rawVariants.length > 0) {
    mappedVariants = rawVariants.map((v: any, index: number) => {
      const vId = v._id?.toString() || v.id || v.sku || `v-${productId}-${index}`;
      const vName = (v.name || v.label || v.unit || v.size || '').trim();

      // Determine regular and sale prices
      const vRegularPrice = typeof v.price === 'number' && v.price > 0 ? v.price : (doc.price ?? 0);
      const vHasSale = typeof v.salePrice === 'number' && v.salePrice > 0 && v.salePrice < vRegularPrice;
      const vEffectivePrice = vHasSale ? v.salePrice : vRegularPrice;
      const vCompareAt = vHasSale
        ? vRegularPrice
        : (typeof v.compareAtPrice === 'number' && v.compareAtPrice > vEffectivePrice ? v.compareAtPrice : null);

      const vStock = typeof v.stock === 'number' ? v.stock : (typeof doc.stock === 'number' ? doc.stock : 0);
      const vLowStockThreshold = typeof v.lowStockThreshold === 'number'
        ? v.lowStockThreshold
        : (typeof doc.lowStockThreshold === 'number' ? doc.lowStockThreshold : 10);
      const vAvailable = vStock > 0 && v.available !== false;
      const vRawImage = (Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : null) || v.image;
      const vImage = normalizeImageSrc(vRawImage) || images[0]?.src || FALLBACK_IMAGE_SRC;

      if (vName && !extractedSizes.includes(vName)) {
        extractedSizes.push(vName);
      }

      let vColor = (v.color || '').trim();
      if (!vColor && vName.includes(' - ')) {
        const parts = vName.split(' - ');
        if (parts.length === 2 && !/\d/.test(parts[0])) {
          vColor = parts[0].trim();
        }
      }
      if (vColor && !extractedColors.some(c => c.name.toLowerCase() === vColor.toLowerCase())) {
        extractedColors.push({
          name: vColor,
          value: v.colorCode || '#222222',
          type: 'hex',
        });
      }

      return {
        id: vId,
        name: vName,
        variantName: vName,
        label: vName,
        size: vName,
        color: vColor,
        unit: v.unit || '',
        price: vEffectivePrice,
        salePrice: v.salePrice ?? null,
        compareAtPrice: vCompareAt,
        image: vImage,
        available: vAvailable,
        sku: v.sku || doc.sku || '',
        stock: vStock,
        lowStockThreshold: vLowStockThreshold,
        weight: typeof v.weight === 'number' ? v.weight : parseWeightInGrams(doc),
      };
    });
  }

  // If no variants in DB, provide single default variant
  if (mappedVariants.length === 0) {
    mappedVariants = [{
      id: `v-default-${productId}`,
      name: '',
      variantName: '',
      color: '',
      size: '',
      label: '',
      unit: doc.unit || '',
      price: finalPrice,
      salePrice: doc.salePrice ?? null,
      compareAtPrice,
      image: images[0]?.src || FALLBACK_IMAGE_SRC,
      available: inStock,
      sku: doc.sku || '',
      stock: typeof doc.stock === 'number' ? doc.stock : 0,
      lowStockThreshold: typeof doc.lowStockThreshold === 'number' ? doc.lowStockThreshold : 10,
      weight: parseWeightInGrams(doc),
    }];
  }

  // Calculate starting / display price (if variants exist with varying prices)
  const displayPrice = mappedVariants.length > 0 && rawVariants.length > 0
    ? (mappedVariants.find(v => v.available)?.price ?? mappedVariants[0].price)
    : finalPrice;

  const resolvedCategory = resolveCategory(doc);

  return {
    id: productId,
    slug: doc.slug,
    name: doc.name,
    vendor: doc.subcategory || resolvedCategory || 'Store',
    brand: doc.subcategory || resolvedCategory || 'Store',
    price: displayPrice,
    compareAtPrice: compareAtPrice,
    currency: 'LKR',
    images,
    variants: mappedVariants,
    colors: extractedColors,
    sizes: extractedSizes,
    category: resolvedCategory,
    subcategory: doc.subcategory || '',
    tags: [doc.subcategory, resolvedCategory].filter(Boolean) as string[],
    availability: inStock ? 'in-stock' : 'out-of-stock',
    badge: isSale ? 'sale' : doc.isFeatured ? 'new' : null,
    description: doc.description || '',
    features: (doc.specifications || []).map((s: any) => `${s.key}: ${s.value}`),
    rating: 5,
    reviewCount: 0,
    reviews: [],
    relatedProducts: [],
    pairsWellWith: [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    sku: doc.sku || '',
    countdownEnd: null,
    stock: typeof doc.stock === 'number' ? doc.stock : 0,
    lowStockThreshold: typeof doc.lowStockThreshold === 'number' ? doc.lowStockThreshold : 10,
    salePrice: typeof doc.salePrice === 'number' ? doc.salePrice : null,
    weight: parseWeightInGrams(doc),
  };
}
