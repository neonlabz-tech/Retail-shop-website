import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';
import type { Product } from '@/types/product';

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
      status: 'active',
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
    console.warn('MongoDB query unavailable in /api/recommendations/random:', (error as Error)?.message);
  }

  return NextResponse.json({
    success: true,
    source: 'empty',
    count: 0,
    limit,
    products: [],
  });
}
