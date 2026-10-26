import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';
import { toysProducts } from '@/data/toys-products';
import { craftAndDecoreProducts } from '@/data/craft-and-decore-products';
import { groceryProducts } from '@/data/grocery-products';
import type { Product } from '@/types/product';

const STATIC_FALLBACK_PRODUCTS: Product[] = [
  ...toysProducts,
  ...craftAndDecoreProducts,
  ...groceryProducts,
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '8')));
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const excludeParam = searchParams.get('exclude');

  try {
    await connectDB();

    const inStockOnly = searchParams.get('inStock') === 'true' || searchParams.get('availability') === 'in-stock';

    const matchQuery: Record<string, any> = {
      status: { $ne: 'archived' },
      ...(inStockOnly ? { stock: { $gt: 0 } } : {}),
    };

    if (excludeParam) {
      const excludeIds = excludeParam
        .split(',')
        .map((s) => s.trim())
        .filter((s) => mongoose.Types.ObjectId.isValid(s))
        .map((s) => new mongoose.Types.ObjectId(s));

      if (excludeIds.length > 0) {
        matchQuery._id = { $nin: excludeIds };
      }
    }

    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchQuery.category = new mongoose.Types.ObjectId(category);
      } else {
        try {
          const db = mongoose.connection.db;
          const categoryDoc = db
            ? await db
                .collection('categories')
                .findOne({
                  $or: [
                    { slug: category.toLowerCase() },
                    { name: { $regex: new RegExp(`^${category}$`, 'i') } },
                  ],
                })
            : null;

          if (categoryDoc) {
            matchQuery.category = categoryDoc._id;
          } else {
            matchQuery.subcategory = { $regex: new RegExp(category, 'i') };
          }
        } catch {
          matchQuery.subcategory = { $regex: new RegExp(category, 'i') };
        }
      }
    }

    if (subcategory && subcategory !== 'all') {
      matchQuery.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }

    const randomDocs = await ProductModel.aggregate([
      { $match: matchQuery },
      { $sample: { size: limit } },
    ]);

    const products = (randomDocs || []).map(formatMongoProduct);

    if (products.length > 0) {
      return NextResponse.json({
        success: true,
        count: products.length,
        limit,
        products,
      });
    }
  } catch (error) {
    console.warn('MongoDB query unavailable in /api/recommendations/random, using fallback catalog:', (error as Error)?.message);
  }

  // Graceful fallback: return random products from store catalog so UI never returns 500
  const inStockOnly = searchParams.get('inStock') === 'true' || searchParams.get('availability') === 'in-stock';
  const source = inStockOnly
    ? STATIC_FALLBACK_PRODUCTS.filter((p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0))
    : STATIC_FALLBACK_PRODUCTS;
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  const fallback = shuffled.slice(0, limit);

  return NextResponse.json({
    success: true,
    source: 'fallback',
    count: fallback.length,
    limit,
    products: fallback,
  });
}
