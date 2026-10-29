import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';

export async function GET(request: NextRequest) {
  try {
    const query = (request.nextUrl.searchParams.get('q') || request.nextUrl.searchParams.get('search') || '').trim();
    const limit = Math.min(20, parseInt(request.nextUrl.searchParams.get('limit') || '8'));

    await connectDB();

    if (!query) {
      const popularDocs = await ProductModel.find({ status: 'active' })
        .sort({ isFeatured: -1, totalSold: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      const formatted = popularDocs.map(formatMongoProduct);
      return NextResponse.json({
        products: formatted,
        suggestions: [],
      });
    }

    const sanitized = query.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').trim().replace(/\s+/g, '.*');
    const searchRegex = new RegExp(sanitized, 'i');
    const searchFilter: Record<string, any> = {
      status: 'active',
      $or: [
        { name: { $regex: searchRegex } },
        { sku: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } },
        { subcategory: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ],
    };

    const matchedDocs = await ProductModel.find(searchFilter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedResults = matchedDocs.map(formatMongoProduct);

    const suggestionsSet = new Set<string>();
    matchedDocs.forEach((doc: any) => {
      if (doc.name) suggestionsSet.add(doc.name);
      if (doc.subcategory) suggestionsSet.add(doc.subcategory);
      if (doc.sku) suggestionsSet.add(doc.sku);
    });

    const suggestions = Array.from(suggestionsSet).slice(0, 5);

    return NextResponse.json({
      products: formattedResults,
      suggestions,
    });
  } catch (error) {
    console.error('Error in /api/search GET:', error);
    return NextResponse.json({ products: [], suggestions: [] });
  }
}
