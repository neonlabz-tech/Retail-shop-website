import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';
import type { Product } from '@/types/product';
import type { FilterCounts } from '@/types/common';

function buildFilterCounts(products: Product[], key: 'category' | 'brand'): FilterCounts[] {
  const map = new Map<string, number>();
  products.forEach((p) => {
    const v = p[key];
    if (!v) return;
    map.set(v, (map.get(v) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

function buildColorCounts(products: Product[]): FilterCounts[] {
  const map = new Map<string, number>();
  products.forEach((p) =>
    p.colors.forEach((c) => map.set(c.name, (map.get(c.name) ?? 0) + 1))
  );
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

function buildSizeCounts(products: Product[]): FilterCounts[] {
  const map = new Map<string, number>();
  products.forEach((p) =>
    p.sizes.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1))
  );
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

let cachedPodProducts: Product[] | null = null;
let lastPodProductsTime = 0;
const POD_CACHE_TTL_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory') || searchParams.get('subCategory');
  const brand = searchParams.get('brand');
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  const minPrice = searchParams.get('minPrice') || searchParams.get('min_price')
    ? parseFloat((searchParams.get('minPrice') || searchParams.get('min_price'))!)
    : undefined;
  const maxPrice = searchParams.get('maxPrice') || searchParams.get('max_price')
    ? parseFloat((searchParams.get('maxPrice') || searchParams.get('max_price'))!)
    : undefined;
  const sort = searchParams.get('sort') || 'featured';
  const availability = searchParams.get('availability') || searchParams.get('inStock');
  const query = (searchParams.get('q') || searchParams.get('search') || '').trim();
  const isSaleParam = searchParams.get('sale') === 'true' || searchParams.get('onSale') === 'true';

  let allPodProducts: Product[] = [];
  const now = Date.now();
  if (cachedPodProducts && now - lastPodProductsTime < POD_CACHE_TTL_MS) {
    allPodProducts = cachedPodProducts;
  } else {
    try {
      await connectDB();
      const mongoDocs = await ProductModel.find({ status: { $ne: 'archived' } }).lean();
      if (mongoDocs && mongoDocs.length > 0) {
        allPodProducts = mongoDocs.map(formatMongoProduct);
        cachedPodProducts = allPodProducts;
        lastPodProductsTime = now;
      }
    } catch (err) {
      console.error('MongoDB query error in /api/pod-products:', err);
      if (cachedPodProducts) allPodProducts = cachedPodProducts;
    }
  }

  let filtered = [...allPodProducts];

  if (isSaleParam) {
    filtered = filtered.filter((p) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price) || p.badge === 'sale');
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  if (subcategory && subcategory !== 'all') {
    const subList = subcategory.toLowerCase().split(',').map((s) => s.trim());
    filtered = filtered.filter((p) =>
      subList.some(
        (s) =>
          p.category.toLowerCase() === s ||
          p.brand.toLowerCase() === s ||
          p.tags.some((t) => t.toLowerCase() === s)
      )
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand && brand !== 'all') {
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (color) {
    filtered = filtered.filter((p) => p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase()));
  }

  if (size) {
    filtered = filtered.filter((p) => p.sizes.some((s) => s.toLowerCase() === size.toLowerCase()));
  }

  if (minPrice !== undefined && !isNaN(minPrice)) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (availability) {
    const avail = availability.toLowerCase();
    if (avail === 'in-stock' || avail === 'in_stock' || avail === 'true') {
      filtered = filtered.filter(
        (p) =>
          p.availability !== 'out-of-stock' &&
          (typeof p.stock !== 'number' || p.stock > 0) &&
          (!p.variants?.[0] || p.variants[0].available !== false)
      );
    } else if (avail === 'out-of-stock' || avail === 'out_of_stock' || avail === 'false') {
      filtered = filtered.filter(
        (p) =>
          p.availability === 'out-of-stock' ||
          (typeof p.stock === 'number' && p.stock <= 0) ||
          (p.variants?.[0] && p.variants[0].available === false)
      );
    }
  }

  const categories = buildFilterCounts(allPodProducts, 'category');
  const brands = buildFilterCounts(allPodProducts, 'brand');
  const colors = buildColorCounts(allPodProducts);
  const sizes = buildSizeCounts(allPodProducts);

  switch (sort) {
    case 'sale':
    case 'discount':
      filtered.sort((a, b) => {
        const discA = a.compareAtPrice && a.compareAtPrice > a.price ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
        const discB = b.compareAtPrice && b.compareAtPrice > b.price ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
        return discB - discA;
      });
      break;
    case 'featured':
      filtered.sort((a, b) => ((b.badge === 'new' || (b as any).isFeatured) ? 1 : 0) - ((a.badge === 'new' || (a as any).isFeatured) ? 1 : 0));
      break;
    case 'name-asc':
    case 'title-asc':
    case 'alphabetical-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
    case 'title-desc':
    case 'alphabetical-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
    case 'price-low-to-high':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
    case 'price-high-to-low':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'date-asc':
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'rating':
    case 'popular':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
    case 'date-desc':
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const totalProducts = filtered.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    products: paginated,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      categories,
      brands,
      colors,
      sizes,
      priceRange: {
        min: 0,
        max: allPodProducts.length ? Math.max(...allPodProducts.map((p) => p.price)) : 0,
      },
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
