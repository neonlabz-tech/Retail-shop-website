import type { SyntheticEvent } from 'react';

export const FALLBACK_IMAGE_SRC =
  'data:image/svg+xml,%3Csvg xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox=%220 0 600 600%22%3E%3Crect width=%22600%22 height=%22600%22 fill=%22%23f3f4f6%22%2F%3E%3Crect x=%22140%22 y=%22140%22 width=%22320%22 height=%22320%22 rx=%2224%22 fill=%22none%22 stroke=%22%23cbd5e1%22 stroke-width=%2218%22%2F%3E%3Ccircle cx=%22230%22 cy=%22240%22 r=%2228%22 fill=%22%23cbd5e1%22%2F%3E%3Cpath d=%22m160 405 95-100 67 70 52-53 66 83H160Z%22 fill=%22%23cbd5e1%22%2F%3E%3C%2Fsvg%3E';

export function normalizeImageSrc(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeImageSrc).find(Boolean) || '';
  }

  if (value && typeof value === 'object') {
    const image = value as Record<string, unknown>;
    return (
      normalizeImageSrc(image.src) ||
      normalizeImageSrc(image.url) ||
      normalizeImageSrc(image.secure_url)
    );
  }

  return '';
}

/**
 * Handles image load errors with an automatic double-check retry mechanism.
 * If an image fails to load (due to temporary network lag or connection drop),
 * it waits briefly and retries up to 2 times before falling back to the placeholder.
 */
export function handleImageError(
  event: SyntheticEvent<HTMLImageElement>,
  maxRetries = 2,
  retryDelayMs = 350
) {
  const image = event.currentTarget;
  if (!image) return;

  const currentSrc = image.getAttribute('src') || image.src || '';

  // If already at fallback or data URI, do nothing
  if (!currentSrc || currentSrc === FALLBACK_IMAGE_SRC || currentSrc.startsWith('data:')) {
    return;
  }

  // Record original source URL on first failure
  if (!image.dataset.originalSrc) {
    image.dataset.originalSrc = currentSrc;
  }

  const originalSrc = image.dataset.originalSrc;
  const currentRetry = parseInt(image.dataset.retryCount || '0', 10);

  // If we haven't reached max retries, retry after a short delay
  if (currentRetry < maxRetries && originalSrc) {
    image.dataset.retryCount = String(currentRetry + 1);

    setTimeout(() => {
      // Append or update cache-busting timestamp to force fresh browser request
      const cleanBase = originalSrc.replace(/([?&])_retry=\d+/, '');
      const sep = cleanBase.includes('?') ? '&' : '?';
      image.src = `${cleanBase}${sep}_retry=${Date.now()}`;
    }, retryDelayMs);

    return;
  }

  // All retries failed: fall back to placeholder
  if (image.src !== FALLBACK_IMAGE_SRC && !image.src.endsWith(FALLBACK_IMAGE_SRC)) {
    image.src = FALLBACK_IMAGE_SRC;
  }
}
