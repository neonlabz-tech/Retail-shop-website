'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export interface ImageWithSkeletonProps extends ImageProps {
  skeletonClassName?: string;
}

export function ImageWithSkeleton({
  className = '',
  skeletonClassName = '',
  alt,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isFill = Boolean(props.fill);

  return (
    <>
      {!isLoaded && !hasError && (
        <div
          className={`skeleton-shimmer pointer-events-none rounded-[inherit] ${
            isFill ? 'absolute inset-0 z-0' : 'w-full h-full'
          } ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        alt={alt || ''}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
        }}
      />
    </>
  );
}
