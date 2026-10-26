import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import RecentlyViewedModel from '@/models/RecentlyViewed';
import { formatMongoProduct } from '@/lib/formatProduct';
import { toysProducts } from '@/data/toys-products';
import { craftAndDecoreProducts } from '@/data/craft-and-decore-products';
import { groceryProducts } from '@/data/grocery-products';
import type { Product } from '@/types/product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATIC_FALLBACK_PRODUCTS: Product[] = [
  ...toysProducts,
  ...craftAndDecoreProducts,
  ...groceryProducts,
];

function resolveCustomerId(request: NextRequest): { customerId: string; isNew: boolean } {
  const param = request.nextUrl.searchParams.get('customerId') || request.nextUrl.searchParams.get('userId');
  if (param) return { customerId: param, isNew: false };

  const cookieId = request.cookies.get('customer_id')?.value;
  if (cookieId) return { customerId: cookieId, isNew: false };

  const newId = 'cust_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  return { customerId: newId, isNew: true };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inStockOnly = searchParams.get('inStock') === 'true' || searchParams.get('availability') === 'in-stock';
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '8'));
  const idsParam = searchParams.get('ids');
  const { customerId } = resolveCustomerId(request);

  try {
    await connectDB();

    const baseStockFilter = inStockOnly ? { stock: { $gt: 0 } } : {};
    let productIds: string[] = [];

    if (idsParam) {
      productIds = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // Case 2: Retrieve from server-side database browsing history
    else if (customerId) {
      const historyDocs = await RecentlyViewedModel.find({ customerId })
        .sort({ viewedAt: -1 })
        .limit(limit)
        .lean();

      productIds = historyDocs.map((doc) => doc.productId.toString());
    }

    if (productIds.length > 0) {
      const validObjectIds = productIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validObjectIds.length > 0) {
        const foundDocs = await ProductModel.find({
          _id: { $in: validObjectIds },
          status: { $ne: 'archived' },
          ...baseStockFilter,
        }).lean();

        const docMap = new Map(foundDocs.map((d) => [d._id.toString(), d]));
        let orderedDocs = productIds
          .map((id) => docMap.get(id))
          .filter(Boolean) as typeof foundDocs;

        // If user hasn't browsed enough products to fill the requested limit (e.g. 5), backfill with other products
        if (orderedDocs.length < limit) {
          const excludeIds = orderedDocs.map((d) => d._id);
          const extraDocs = await ProductModel.find({
            _id: { $nin: excludeIds },
            status: { $ne: 'archived' },
            ...baseStockFilter,
          })
            .limit(limit - orderedDocs.length)
            .lean();
          orderedDocs = [...orderedDocs, ...extraDocs];
        }

        const formatted = orderedDocs.map(formatMongoProduct);

        return NextResponse.json({
          success: true,
          source: 'mongodb',
          customerId,
          count: formatted.length,
          products: formatted,
        });
      }
    }

    // Fallback if no history exists yet: provide trending products up to limit so the grid is full
    const fallbackDocs = await ProductModel.find({
      status: { $ne: 'archived' },
      ...baseStockFilter,
    })
      .limit(limit)
      .lean();

    const formattedFallback = fallbackDocs.map(formatMongoProduct);

    return NextResponse.json({
      success: true,
      source: 'fallback',
      customerId,
      count: formattedFallback.length,
      products: formattedFallback,
    });
  } catch (error) {
    console.warn('MongoDB unavailable in /api/recommendations/recently-viewed GET, using fallback catalog:', (error as Error)?.message);
    const sourceList = inStockOnly
      ? STATIC_FALLBACK_PRODUCTS.filter((p) => p.availability !== 'out-of-stock' && (typeof p.stock !== 'number' || p.stock > 0))
      : STATIC_FALLBACK_PRODUCTS;
    const shuffled = [...sourceList].slice(0, limit);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      customerId,
      count: shuffled.length,
      products: shuffled,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let customerId = body.customerId;
    const productId = body.productId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'Valid MongoDB productId is required' },
        { status: 400 }
      );
    }

    let isNewCustomer = false;
    if (!customerId) {
      const resolved = resolveCustomerId(request);
      customerId = resolved.customerId;
      isNewCustomer = resolved.isNew;
    }

    await connectDB();

    const productObjectId = new mongoose.Types.ObjectId(productId);

    await RecentlyViewedModel.findOneAndUpdate(
      { customerId, productId: productObjectId },
      { $set: { viewedAt: new Date() } },
      { upsert: true, new: true }
    );

    const allForUser = await RecentlyViewedModel.find({ customerId })
      .sort({ viewedAt: -1 })
      .skip(30)
      .select('_id')
      .lean();

    if (allForUser.length > 0) {
      await RecentlyViewedModel.deleteMany({
        _id: { $in: allForUser.map((d) => d._id) },
      });
    }

    const response = NextResponse.json({
      success: true,
      customerId,
      productId,
    });

    if (isNewCustomer) {
      response.cookies.set('customer_id', customerId, {
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.warn('MongoDB unavailable in /api/recommendations/recently-viewed POST:', (error as Error)?.message);
    return NextResponse.json({
      success: false,
      error: 'Database unavailable',
    });
  }
}
