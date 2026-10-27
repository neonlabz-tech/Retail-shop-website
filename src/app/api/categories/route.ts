import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

let cachedCategoriesData: { categories: any[]; subcategories: any[] } | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes in-memory cache

export async function GET() {
  const now = Date.now();
  if (cachedCategoriesData && now - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedCategoriesData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
      },
    });
  }

  try {
    const conn = await connectDB();
    const db = conn.connection.db;
    if (!db) throw new Error('Database not connected');

    const mongoCats = await db.collection('categories').find({}).toArray();

    if (mongoCats && mongoCats.length > 0) {
      const products = await db
        .collection('products')
        .find({}, { projection: { category: 1, subcategory: 1, images: 1, name: 1 } })
        .toArray();

      const catSubMap = new Map<string, Set<string>>();
      mongoCats.forEach((c) => catSubMap.set(c._id.toString(), new Set<string>()));

      products.forEach((p) => {
        const catId = p.category ? p.category.toString() : '';
        if (catSubMap.has(catId) && p.subcategory) {
          catSubMap.get(catId)!.add(p.subcategory);
        }
      });

      const categoriesWithSubs = mongoCats.map((c) => {
        const subSet = catSubMap.get(c._id.toString()) || new Set();
        const catIdStr = c._id.toString();

        const matchingProducts = products.filter((p) => {
          const pCat = p.category ? p.category.toString() : '';
          const pSub = p.subcategory ? p.subcategory.toString() : '';
          return (
            pCat === catIdStr ||
            pCat.toLowerCase() === c.name.toLowerCase() ||
            pCat.toLowerCase() === c.slug.toLowerCase() ||
            subSet.has(pCat) ||
            (pSub && subSet.has(pSub))
          );
        });

        const image = (c.image && typeof c.image === 'string' && c.image.trim() !== '')
          ? c.image
          : '';

        return {
          id: catIdStr,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image,
          productCount: matchingProducts.length,
          subcategories: Array.from(subSet),
        };
      });

      const subcategoryItems: Array<{ id: string; name: string; slug: string; categoryName: string; image: string; count: number }> = [];
      const seenSubs = new Set<string>();

      products.forEach((p) => {
        const sub = p.subcategory || p.category;
        if (sub && typeof sub === 'string' && !seenSubs.has(sub.toLowerCase())) {
          seenSubs.add(sub.toLowerCase());
          const subProducts = products.filter(
            (sp) =>
              (sp.subcategory && sp.subcategory.toLowerCase() === sub.toLowerCase()) ||
              (sp.category && sp.category.toString().toLowerCase() === sub.toLowerCase())
          );
          const firstImgProd = subProducts.find((sp) => {
            if (!sp.images || !Array.isArray(sp.images) || sp.images.length === 0) return false;
            const img0 = sp.images[0];
            return typeof img0 === 'string' ? img0.length > 0 : Boolean(img0?.src);
          });
          const firstImg = firstImgProd
            ? (typeof firstImgProd.images[0] === 'string' ? firstImgProd.images[0] : firstImgProd.images[0]?.src)
            : '';
          if (firstImg) {
            subcategoryItems.push({
              id: `sub-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              name: sub,
              slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              categoryName: typeof p.category === 'string' ? p.category : '',
              image: firstImg,
              count: subProducts.length,
            });
          }
        }
      });

      cachedCategoriesData = {
        categories: categoriesWithSubs,
        subcategories: subcategoryItems,
      };
      lastCacheTime = Date.now();

      return NextResponse.json(cachedCategoriesData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        },
      });
    }
  } catch (err) {
    console.error('MongoDB categories query error:', err);
  }

  return NextResponse.json({ categories: [], subcategories: [] });
}
