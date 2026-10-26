'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';
import type { ProductsApiResponse } from '@/types/common';

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  collection?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  availability?: string;
  q?: string;
  sale?: boolean | string;
  onSale?: boolean | string;
}

interface UseProductsOptions {
  endpoint?: string;
}

export function useProducts(params: UseProductsParams = {}, options: UseProductsOptions = {}) {
  const endpoint = options.endpoint ?? '/api/products';
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: () =>
      apiFetch<ProductsApiResponse>(endpoint, { params: params as Record<string, string | number | undefined> }),
    placeholderData: keepPreviousData,
  });
}
