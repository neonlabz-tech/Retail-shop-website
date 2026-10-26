import { NextRequest, NextResponse } from 'next/server';
import { activeWearProducts } from '@/data/active-wear-products';
import type { Product } from '@/types/product';
import type { FilterCounts } from '@/types/common';

//filter counts
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const sort = searchParams.get('sort') || 'featured';
  const availability = searchParams.get('availability');
  const query = searchParams.get('q');

  let filtered = [...activeWearProducts];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }
  if (category) filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (brand) filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  if (color) filtered = filtered.filter((p) => p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase()));
  if (size) filtered = filtered.filter((p) => p.sizes.some((s) => s.toLowerCase() === size.toLowerCase()));
  if (minPrice !== undefined) filtered = filtered.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) filtered = filtered.filter((p) => p.price <= maxPrice);
  if (availability) filtered = filtered.filter((p) => p.availability === availability);

  const categories = buildFilterCounts(activeWearProducts, 'category');
  const brands = buildFilterCounts(activeWearProducts, 'brand');
  const colors = buildColorCounts(activeWearProducts);
  const sizes = buildSizeCounts(activeWearProducts);

  const prices = activeWearProducts.map((p) => p.price);
  const priceRange = {
    min: Math.min(...prices, 0),
    max: Math.max(...prices, 100),
  };

  switch (sort) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    case 'best-selling': filtered.sort((a, b) => b.reviewCount - a.reviewCount); break;
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: break;
  }

  const totalProducts = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

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
      priceRange,
    },
  });
}
