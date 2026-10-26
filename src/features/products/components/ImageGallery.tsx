'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import type { ProductImage } from '@/types/product';
import { handleImageError } from '@/lib/imageFallback';

interface ImageGalleryProps {
  images: ProductImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex] || images[0];

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-bg-light rounded-[var(--radius-md)] overflow-hidden mb-[1.5rem]">
        {mainImage && (
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            onError={handleImageError}
            className="object-cover"
            sizes="(max-width: 991px) 100vw, 50vw"
            priority
          />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-[1rem] overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-[8rem] h-[10rem] flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-colors',
                selectedIndex === index ? 'border-dark' : 'border-transparent hover:border-border'
              )}
            >
              <Image src={img.src} alt={img.alt} fill onError={handleImageError} className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
