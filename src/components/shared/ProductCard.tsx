'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCompareStore } from '@/store/compareStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleItem: toggleCompare } = useCompareStore();
  const { openQuickView } = useUIStore();

  const primaryImage = product.images[0]?.src || '/fashion/products/placeholder.jpg';
  const secondaryImage = product.images[1]?.src || primaryImage;
  const inWishlist = isInWishlist(product.id);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = product.variants?.[0];
    const variantId = variant?.id || product.id || 'default';
    const image = variant?.image || primaryImage;
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      slug: product.slug,
      image,
      color: variant?.color || '',
      size: variant?.size || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
      vendor: product.vendor,
      weight: product.weight || 0,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: primaryImage,
      image2: secondaryImage,
      slug: product.slug,
      badge: product.badge,
      colors: product.colors.map(c => ({ name: c.name, value: c.value })),
      vendor: product.vendor,
    });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickView(product);
  };

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[#eef2f6] border border-[#ededf0] mb-[1.2rem] shadow-[0_8px_16px_-2px_rgba(24,62,132,0.12),4px_6px_10px_-2px_rgba(24,62,132,0.04),-4px_6px_10px_-2px_rgba(24,62,132,0.04)]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={cn('object-contain object-center transition-all duration-500 ease-out', isHovered ? 'opacity-0 scale-108' : 'opacity-100 scale-100')}
            sizes="(max-width: 749px) 50vw, (max-width: 991px) 50vw, 33vw"
          />
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate`}
            fill
            className={cn('object-contain object-center transition-all duration-500 ease-out', isHovered ? 'opacity-100 scale-108' : 'opacity-0 scale-100')}
            sizes="(max-width: 749px) 50vw, (max-width: 991px) 50vw, 33vw"
          />
        </div>

        {product.badge && (
          <div className="absolute top-[1rem] start-[1rem] z-10">
            <Badge variant={product.badge}>
              {product.badge === 'sale' && 'Sale'}
              {product.badge === 'new' && 'New'}
              {product.badge === 'pre-order' && 'Pre Order'}
            </Badge>
          </div>
        )}

        {product.countdownEnd && (
          <div className="absolute bottom-[1rem] start-[1rem] z-10 flex gap-[0.4rem]">
            <span className="bg-dark/80 text-white text-[1rem] px-[0.6rem] py-[0.3rem] rounded-[0.3rem]">Sale Active</span>

          </div>
        )}

        <div className={cn(
          'absolute end-[1rem] top-[1rem] flex flex-col gap-[0.6rem] transition-all duration-300 z-10',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[1rem]'
        )}>
          <button
            onClick={handleWishlist}
            className={cn(
              'w-[3.4rem] h-[3.4rem] bg-white rounded-full shadow-md flex items-center justify-center text-[1.4rem] hover:bg-dark hover:text-white transition-colors',
              inWishlist && 'bg-primary text-white'
            )}
            aria-label="Add to wishlist"
          >
            ♥
          </button>
          <button
            onClick={handleQuickView}
            className="w-[3.4rem] h-[3.4rem] bg-white rounded-full shadow-md flex items-center justify-center text-[1.4rem] hover:bg-dark hover:text-white transition-colors"
            aria-label="Quick view"
          >
            👁
          </button>
          <button
            onClick={handleAddToCart}
            className="w-[3.4rem] h-[3.4rem] bg-white rounded-full shadow-md flex items-center justify-center text-[1.4rem] hover:bg-dark hover:text-white transition-colors"
            aria-label="Quick add"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
              <path d="M9 6H15C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6ZM7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6H20C20.5523 6 21 6.44772 21 7V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V7C3 6.44772 3.44772 6 4 6H7ZM5 8V20H19V8H5ZM9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10H17C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10H9Z" />
            </svg>
          </button>
        </div>
      </Link>

      <div>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[1.4rem] font-medium text-heading line-clamp-1 mb-[0.4rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-[6px] mb-[0.6rem] flex-wrap">
          <span className="product-price-text text-[1.4rem] font-bold text-heading">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-[#F15B41] bg-[#fff0ed] text-[1.1rem] font-bold px-[5px] py-[1px] rounded-[3px] leading-none">
              -{discount}%
            </span>
          )}
          {product.compareAtPrice && (
            <span className="text-[1.2rem] text-body line-through font-normal">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.colors.length > 0 && (
          <ColorSwatch colors={product.colors} maxVisible={3} size="sm" />
        )}
      </div>
    </div>
  );
}
