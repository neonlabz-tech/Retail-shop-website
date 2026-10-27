import type { Metadata } from 'next';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';
import { ProductDetailContent } from '@/features/products/components/ProductDetailContent';
import type { Product } from '@/types/product';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProductBySlugOrId(slug: string): Promise<Product | null> {
  try {
    await connectDB();
    const decodedSlug = decodeURIComponent(slug).trim();
    const normalizedSlug = decodedSlug.toLowerCase().replace(/[\u2013\u2014]/g, '-');
    const isMongoId = mongoose.Types.ObjectId.isValid(slug) && slug.length === 24;

    const orConditions: any[] = [
      { slug: decodedSlug },
      { slug },
    ];
    if (normalizedSlug !== decodedSlug) {
      orConditions.push({ slug: normalizedSlug });
    }
    if (isMongoId) {
      orConditions.push({ _id: slug });
    }

    let doc = await ProductModel.findOne({ $or: orConditions }).lean();

    if (!doc && !isMongoId) {
      const escaped = decodedSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[-–— ]');
      const flexibleRegex = new RegExp(`^${escaped}$`, 'i');
      doc = await ProductModel.findOne({
        $or: [{ slug: flexibleRegex }, { name: flexibleRegex }],
      }).lean();
    }

    if (doc) {
      return formatMongoProduct(doc);
    }
  } catch {
    // Ignore DB errors during metadata generation
  }
  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlugOrId(slug);

  if (!product) {
    return { title: 'Product Details' };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({ url: img.src })),
      type: 'website',
    },
  };
}

function getApiEndpoint(_slug?: string): string {
  return '/api/products';
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const apiEndpoint = getApiEndpoint(slug);
  const product = await fetchProductBySlugOrId(slug);

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getStructuredData(product)),
          }}
        />
      )}
      <ProductDetailContent slug={slug} apiEndpoint={apiEndpoint} />
    </>
  );
}

function getStructuredData(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => img.src),
    description: product.description,
    brand: { '@type': 'Brand', name: product.vendor },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: product.currency,
      availability:
        product.availability === 'in-stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            reviewCount: product.reviewCount.toString(),
          }
        : undefined,
  };
}
