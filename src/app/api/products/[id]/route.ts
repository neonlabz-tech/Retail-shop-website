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
    if (!id) {
      return NextResponse.json({ error: 'Product ID or slug is required' }, { status: 400 });
    }

    await connectDB();
    const decodedId = decodeURIComponent(id).trim();
    const normalizedSlug = decodedId.toLowerCase().replace(/[\u2013\u2014]/g, '-');
    const isMongoId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;

    const orConditions: any[] = [
      { slug: decodedId },
      { slug: id },
    ];
    if (normalizedSlug !== decodedId) {
      orConditions.push({ slug: normalizedSlug });
    }
    if (isMongoId) {
      orConditions.push({ _id: id });
    }

    let mongoProduct = await Product.findOne({ status: 'active', $or: orConditions }).lean();

    if (!mongoProduct && !isMongoId) {
      const escaped = decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[-–— ]');
      const flexibleRegex = new RegExp(`^${escaped}$`, 'i');
      mongoProduct = await Product.findOne({
        status: 'active',
        $or: [{ slug: flexibleRegex }, { name: flexibleRegex }],
      }).lean();
    }

    if (mongoProduct && (mongoProduct as any).status === 'active') {
      const formatted = formatMongoProduct(mongoProduct);
      return NextResponse.json({ product: formatted });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
