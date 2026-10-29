import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();
    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query: Record<string, any> = isMongoId
      ? { status: 'active', $or: [{ _id: id }, { slug: id }] }
      : { status: 'active', slug: id };

    const mongoProduct = await Product.findOne(query).lean();

    if (mongoProduct && (mongoProduct as any).status === 'active') {
      const formatted = formatMongoProduct(mongoProduct);
      return NextResponse.json({ product: formatted });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching POD product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
