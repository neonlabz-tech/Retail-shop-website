'use client';

import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '@/features/products/hooks/useProducts';
import { HomeProductCard } from '@/features/home/components/HomeProductCard';
import { FeaturedSlider, type FeaturedCardTheme } from '@/features/home/components/FeaturedSlider';
import { MobileFilterDrawer, IconFilter } from './MobileFilterDrawer';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SORT_OPTIONS, PRODUCTS_PER_PAGE } from '@/lib/constants';
import type { FiltersData } from '@/types/common';
import type { Product } from '@/types/product';

function IconCol2() {
  return (
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5.5 12.5" width="12" height="14">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
    </svg>
  );
}

function IconCol3() {
  return (
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.5 12.5" width="14" height="14">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" fillRule="evenodd" />
    </svg>
  );
}

function IconCol4() {
  return (
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.5 12.5" width="16" height="14">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" fillRule="evenodd" />
      <path d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 0112.75 0z" fillRule="evenodd" />
    </svg>
  );
}

function IconSort() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" width="16" height="10" fill="currentColor">
      <path d="m0 0h16v2h-16zm0 4h12v2h-12zm0 4h8v2h-8z" />
    </svg>
  );
}

function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
    </svg>
  );
}

export interface ShopPageTheme {
  headerBg: string;
  toolbarBg: string;
  sidebarBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  accentColor: string;
  inputBg: string;
  tagBg: string;
}

const DEFAULT_THEME: ShopPageTheme = {
  headerBg: 'rgb(247, 248, 252)',
  toolbarBg: 'rgb(247, 248, 252)',
  sidebarBg: 'rgb(247, 248, 252)',
  textColor: '#222',
  mutedColor: '#555',
  borderColor: '#e5e5e5',
  accentColor: '#222',
  inputBg: '#fff',
  tagBg: '#fff',
};

const ShopThemeCtx = createContext<ShopPageTheme>(DEFAULT_THEME);

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useContext(ShopThemeCtx);
  return (
    <div className="border-b border-solid pb-[20px] mb-[20px]" style={{ borderColor: theme.borderColor }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="filter-group-title flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-[17px] font-bold pt-0 px-0 pb-[4px]"
        style={{ color: theme.textColor }}
      >
        {title}
        <span className={`transition-transform duration-300 ease-in-out inline-flex ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <IconChevronDown size={14} />
        </span>
      </button>
      {isOpen && <div className="pt-[14px]">{children}</div>}
    </div>
  );
}

function FilterCheckbox({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  const theme = useContext(ShopThemeCtx);
  return (
    <label className="filter-checkbox-row flex items-center gap-[12px] cursor-pointer py-[6px] px-0 text-[14px]" style={{ color: theme.mutedColor }}>
      <span
        className="filter-cb w-[20px] h-[20px] rounded-[3px] shrink-0 border-[2px] border-solid flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          borderColor: checked ? theme.accentColor : theme.borderColor,
          backgroundColor: checked ? theme.accentColor : theme.inputBg,
        }}
      >
        {checked && (
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d="M1.5 3.5L2.83333 4.75L4.16667 6L9.5 1" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>{label}</span>
      {count !== undefined && <span className="ml-auto text-[15px]" style={{ color: theme.borderColor }}>{count}</span>}
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

function FilterRadio({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  const theme = useContext(ShopThemeCtx);
  return (
    <label
      className={`filter-radio-row flex items-center gap-[12px] cursor-pointer py-[6px] px-0 text-[14px] transition-colors duration-200 ease-in-out ${
        checked ? 'font-semibold' : 'font-normal'
      }`}
      style={{
        color: checked ? theme.textColor : theme.mutedColor,
      }}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
    >
      <span
        className="filter-rb w-[20px] h-[20px] rounded-full shrink-0 border-[2px] border-solid flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          borderColor: checked ? theme.accentColor : theme.borderColor,
          backgroundColor: theme.inputBg,
        }}
      >
        {checked && (
          <span
            className="w-[10px] h-[10px] rounded-full"
            style={{
              backgroundColor: theme.accentColor,
            }}
          />
        )}
      </span>
      <span>{label}</span>
      {count !== undefined && <span className="ml-auto text-[15px]" style={{ color: theme.borderColor }}>{count}</span>}
    </label>
  );
}

function IconCloseSmall() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.48627 9.32917L2.82849 3.67098" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.88539 9.38504L8.42932 3.61524" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  const theme = useContext(ShopThemeCtx);
  return (
    <span
      className="inline-flex items-center gap-[8px] py-[8px] px-[16px] text-[14px] border border-solid rounded-[40px] mb-[8px] mr-[8px]"
      style={{ color: theme.mutedColor, borderColor: theme.borderColor, backgroundColor: theme.tagBg }}
    >
      {label}
      <button
        className="filter-tag-remove flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
        onClick={onRemove}
        style={{ color: theme.mutedColor }}
      >
        <IconCloseSmall />
      </button>
    </span>
  );
}

function FilterSidebar({
  filters,
  selectedFilters,
  onFilterChange,
  onBatchFilterChange,
  priceRange,
  onPriceChange,
  onRemoveAll,
}: {
  filters: FiltersData | undefined;
  selectedFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onBatchFilterChange?: (updates: Record<string, string>) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  onRemoveAll: () => void;
}) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const theme = useContext(ShopThemeCtx);

  if (!filters) return null;

  const hasActiveFilters =
    Object.values(selectedFilters).some((v) => v !== '') ||
    priceRange[0] > 0 ||
    priceRange[1] < filters.priceRange.max;

  const activeSubcategories = selectedFilters.subcategory
    ? selectedFilters.subcategory
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const activeFilterTags: { label: string; key: string }[] = [];
  if (selectedFilters.search) {
    activeFilterTags.push({ label: `Search: "${selectedFilters.search}"`, key: 'q' });
  }
  if (priceRange[0] > 0 || priceRange[1] < filters.priceRange.max) {
    activeFilterTags.push({
      label: `LKR ${priceRange[0].toLocaleString('en-US')} – LKR ${priceRange[1].toLocaleString('en-US')}`,
      key: 'price',
    });
  }
  if (selectedFilters.availability) {
    activeFilterTags.push({ label: `Availability: ${selectedFilters.availability}`, key: 'availability' });
  }
  if (selectedFilters.category) {
    activeFilterTags.push({ label: `Category: ${selectedFilters.category}`, key: 'category' });
  }
  activeSubcategories.forEach((sub) => {
    activeFilterTags.push({ label: `Subcategory: ${sub}`, key: `sub:${sub}` });
  });

  return (
    <div className="rounded-[8px] p-[28px] overflow-hidden" style={{ backgroundColor: theme.sidebarBg }}>
      <div className="flex items-center justify-between mb-[20px]">
        <h3 className="filter-group-title text-[20px] font-bold m-0" style={{ color: theme.textColor }}>
          Filter:
        </h3>
        {hasActiveFilters && (
          <button
            className="filter-remove-all text-[14px] text-[#F15B41] bg-transparent border-none cursor-pointer font-medium"
            onClick={onRemoveAll}
          >
            Remove all
          </button>
        )}
      </div>

      {activeFilterTags.length > 0 && (
        <div className="mb-[16px] flex flex-wrap">
          {activeFilterTags.map((tag) => (
            <FilterTag
              key={tag.key}
              label={tag.label}
              onRemove={() => {
                if (tag.key === 'q') {
                  if (onBatchFilterChange) onBatchFilterChange({ q: '', search: '' });
                  else onFilterChange('q', '');
                } else if (tag.key === 'price') {
                  onPriceChange([0, filters.priceRange.max]);
                } else if (tag.key === 'category') {
                  if (onBatchFilterChange) onBatchFilterChange({ category: '', subcategory: '' });
                  else {
                    onFilterChange('category', '');
                    onFilterChange('subcategory', '');
                  }
                } else if (tag.key.startsWith('sub:')) {
                  const subToRemove = tag.key.slice(4);
                  const remaining = activeSubcategories.filter((s) => s !== subToRemove);
                  onFilterChange('subcategory', remaining.join(','));
                } else {
                  onFilterChange(tag.key, '');
                }
              }}
            />
          ))}
        </div>
      )}

      <FilterGroup title="Availability">
        <FilterCheckbox
          label="In stock"
          count={filters.availability?.inStock ?? filters.categories.reduce((s, c) => s + c.count, 0)}
          checked={selectedFilters.availability === 'in-stock'}
          onChange={() => onFilterChange('availability', selectedFilters.availability === 'in-stock' ? '' : 'in-stock')}
        />
        <FilterCheckbox
          label="Out of stock"
          count={filters.availability?.outOfStock ?? 0}
          checked={selectedFilters.availability === 'out-of-stock'}
          onChange={() => onFilterChange('availability', selectedFilters.availability === 'out-of-stock' ? '' : 'out-of-stock')}
        />
      </FilterGroup>

      <FilterGroup title="Price">
        <PriceRangeSlider
          min={0}
          max={filters.priceRange.max}
          value={priceRange}
          onChange={onPriceChange}
          accentColor={theme.accentColor}
          mutedColor={theme.mutedColor}
          textColor={theme.textColor}
        />
      </FilterGroup>

      <FilterGroup title="More filters">
        {filters.categories && filters.categories.length > 0 && (
          <div className={selectedFilters.category ? 'mb-[20px]' : 'mb-0'}>
            <p
              className="text-[13px] font-semibold mb-[8px] uppercase tracking-[0.5px]"
              style={{ color: theme.textColor }}
            >
              Categories
            </p>
            {filters.categories.map((c) => {
              const isSelected = selectedFilters.category === c.name;
              return (
                <FilterRadio
                  key={`cat-${c.name}`}
                  label={c.name}
                  count={c.count}
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      if (onBatchFilterChange) onBatchFilterChange({ category: '', subcategory: '' });
                      else {
                        onFilterChange('category', '');
                        onFilterChange('subcategory', '');
                      }
                    } else {
                      if (onBatchFilterChange) onBatchFilterChange({ category: c.name, subcategory: '' });
                      else {
                        onFilterChange('category', c.name);
                        onFilterChange('subcategory', '');
                      }
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {selectedFilters.category && (
          <div className="pt-[16px] border-t border-dashed" style={{ borderColor: theme.borderColor }}>
            <p
              className="text-[13px] font-semibold mb-[8px] uppercase tracking-[0.5px]"
              style={{ color: theme.textColor }}
            >
              Subcategories ({selectedFilters.category})
            </p>
            {(() => {
              const categorySubs = filters.categorySubcategories?.[selectedFilters.category] || [];

              if (categorySubs.length === 0) {
                return (
                  <p className="text-[13px] italic my-[6px] mx-0" style={{ color: theme.mutedColor }}>
                    No subcategories available.
                  </p>
                );
              }

              const visibleSubs = showMoreFilters ? categorySubs : categorySubs.slice(0, 8);

              return (
                <>
                  {visibleSubs.map((sub) => {
                    const isChecked = activeSubcategories.includes(sub.name);
                    return (
                      <FilterCheckbox
                        key={`sub-${sub.name}`}
                        label={sub.name}
                        count={sub.count}
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked
                            ? activeSubcategories.filter((s) => s !== sub.name)
                            : [...activeSubcategories, sub.name];
                          onFilterChange('subcategory', updated.join(','));
                        }}
                      />
                    );
                  })}
                  {categorySubs.length > 8 && (
                    <button
                      onClick={() => setShowMoreFilters(!showMoreFilters)}
                      className="filter-show-more text-[14px] bg-transparent border-none cursor-pointer mt-[8px] font-medium"
                      style={{ color: theme.textColor }}
                    >
                      {showMoreFilters ? '- Show less' : '+ Show more'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </FilterGroup>

    </div>
  );
}

function ShopPagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const theme = useContext(ShopThemeCtx);

  const pages: (number | '...')[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (currentPage > 4) pages.push('...');
    if (currentPage > 3 && currentPage < totalPages - 2) {
      pages.push(currentPage);
    }
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
  }

  const unique: (number | '...')[] = [];
  pages.forEach((p) => {
    if (p === '...' && unique[unique.length - 1] === '...') return;
    if (typeof p === 'number' && unique.includes(p)) return;
    unique.push(p);
  });

  return (
    <div className="flex items-center justify-center gap-[10px] min-[750px]:gap-[12px] mt-[24px] min-[750px]:mt-[44px] pb-0">
      {unique.map((p, i) => p === '...' ? (
        <span key={`dots-${i}`} className="text-[16px] tracking-[2px]" style={{ color: theme.mutedColor }}>...</span>
      ) : (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full border-none text-[16px] font-medium cursor-pointer transition-all duration-[250ms] ease-in-out"
          style={{
            backgroundColor: p === currentPage ? theme.accentColor : 'transparent',
            color: p === currentPage ? '#fff' : theme.textColor,
          }}
          onMouseEnter={(e) => { if (p !== currentPage) { e.currentTarget.style.backgroundColor = theme.inputBg; } }}
          onMouseLeave={(e) => { if (p !== currentPage) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
        >
          {p}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer text-[18px]"
          style={{ color: theme.textColor }}
          aria-label="Next page"
        >
          ›
        </button>
      )}
    </div>
  );
}

function ProductSkeleton({ cardVariant = 'home' }: { cardVariant?: 'home' | 'grocery' }) {
  return (
    <div>
      <div
        className={`animate-shimmer mb-[14px] ${
          cardVariant === 'grocery' ? 'aspect-square rounded-[10px]' : 'aspect-[3/4] rounded-[4px]'
        }`}
      />
      <div className="animate-shimmer h-[16px] w-[70%] mx-auto mt-0 mb-[8px] rounded-[4px]" />
      <div className="animate-shimmer h-[14px] w-[40%] mx-auto mt-0 mb-[12px] rounded-[4px]" />
      {cardVariant === 'grocery' && (
        <div className="animate-shimmer h-[52px] w-full rounded-[40px]" />
      )}
    </div>
  );
}

interface ShopPageContentProps {
  basePath?: string;
  apiEndpoint?: string;
  productHrefBase?: string;
  title?: string;
  homeLabel?: string;
  homeHref?: string;
  breadcrumbLabel?: string;
  cardVariant?: 'home' | 'grocery';
  cardTheme?: FeaturedCardTheme;
  shopTheme?: Partial<ShopPageTheme>;
  renderCard?: (product: Product, index: number) => React.ReactNode;
}

export function ShopPageContent({
  basePath = '/products',
  apiEndpoint = '/api/products',
  productHrefBase = '/products',
  title = 'PRODUCTS',
  homeLabel = 'Home',
  homeHref = '/',
  breadcrumbLabel = 'Products',
  cardVariant = 'home',
  cardTheme,
  shopTheme,
  renderCard,
}: ShopPageContentProps = {}) {
  const theme: ShopPageTheme = { ...DEFAULT_THEME, ...shopTheme };
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [savedView, setSavedView] = useState<2 | 3 | 4>(4);
  useEffect(() => {
    const stored = localStorage.getItem('shop-view-cols');
    if (stored === '2' || stored === '3' || stored === '4') setSavedView(Number(stored) as 2 | 3 | 4);
  }, []);
  const viewCols: 2 | 3 | 4 = viewParam === '2' ? 2 : viewParam === '3' ? 3 : viewParam === '4' ? 4 : savedView;
  const [sortOpen, setSortOpen] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const filterTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const prevFiltersRef = useRef('');
  const currentFilterKey = `${searchParams.toString()}`;

  const setViewCols = useCallback((cols: 2 | 3 | 4) => {
    localStorage.setItem('shop-view-cols', String(cols));
    setSavedView(cols);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', String(cols));
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }, [router, searchParams, basePath]);

  const searchQuery = (searchParams.get('q') || searchParams.get('search') || '').trim();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'featured';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const collection = searchParams.get('collection') || '';
  const brand = searchParams.get('brand') || '';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const availability = searchParams.get('availability') || '';
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : undefined;

  const { data, isLoading } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    sort,
    q: searchQuery || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
    collection: collection || undefined,
    brand: brand || undefined,
    color: color || undefined,
    size: size || undefined,
    availability: availability || undefined,
    minPrice: minPrice || undefined,
    maxPrice,
  }, { endpoint: apiEndpoint });

  const displayMaxPrice = maxPrice ?? data?.filters?.priceRange.max ?? 0;

  const filtersDataRef = useRef(data?.filters);
  if (data?.filters) {
    filtersDataRef.current = data.filters;
  }

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!('page' in updates)) params.set('page', '1');
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  }, [router, searchParams, basePath]);

  const handleFilterChange = (key: string, value: string) => updateParams({ [key]: value });
  const handlePriceChange = useCallback((range: [number, number]) => {
    updateParams({
      minPrice: range[0] > 0 ? String(range[0]) : '',
      maxPrice: range[1] < (data?.filters?.priceRange.max ?? range[1]) ? String(range[1]) : '',
    });
  }, [updateParams, data?.filters?.priceRange.max]);
  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ShopThemeCtx.Provider value={theme}>
      <div className="container-main pt-[16px] min-[750px]:pt-[20px]">
        <div className="rounded-[10px] h-[80px] min-[750px]:h-[88px] flex items-center py-0 px-[24px] min-[750px]:px-[32px]" style={{ backgroundColor: theme.headerBg }}>
          <div>
            <h1 className="text-[24px] min-[750px]:text-[28px] font-bold mb-[3px]" style={{ color: theme.textColor }}>
              {searchQuery ? `Search: "${searchQuery}"` : title}
            </h1>
            <div className="flex items-center gap-[6px] text-[13px] min-[750px]:text-[14px]">
              <Link href={homeHref} className="underline underline-offset-[3px]" style={{ color: theme.mutedColor }}>{homeLabel}</Link>
              <span className="text-[#bbb]">/</span>
              <span style={{ color: theme.textColor }}>{searchQuery ? 'Search Results' : breadcrumbLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main">
        <div className="flex items-center justify-between h-[50px] min-[750px]:h-[52px] rounded-[8px] py-0 px-[16px] mb-[20px] min-[750px]:mb-[24px] mt-[12px] min-[750px]:mt-[14px]" style={{ backgroundColor: theme.toolbarBg }}>
          <div className="shop-view-toggles flex items-center gap-[6px]">
            {([
              { cols: 2 as const, Icon: IconCol2 },
              { cols: 3 as const, Icon: IconCol3 },
              { cols: 4 as const, Icon: IconCol4 },
            ]).map(({ cols, Icon }) => (
              <button
                key={cols}
                onClick={() => setViewCols(cols)}
                className="w-[36px] h-[36px] flex items-center justify-center border border-solid cursor-pointer rounded-[4px] transition-all duration-200 ease-in-out"
                style={{
                  borderColor: viewCols === cols ? theme.accentColor : theme.borderColor,
                  backgroundColor: viewCols === cols ? theme.accentColor : theme.inputBg,
                  color: viewCols === cols ? '#fff' : theme.mutedColor,
                }}
              >
                <Icon />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="shop-mobile-filter-btn"
            aria-label="Open filter and sort"
          >
            <IconFilter size={18} />
            <span>Filter and sort</span>
          </button>

          <div className="shop-sort-group flex items-center gap-[24px]">
            <div className="shop-sort-dropdown relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-[10px] bg-transparent border-none cursor-pointer text-[15px] font-semibold tracking-[0.5px]"
                style={{ color: theme.textColor }}
              >
                <IconSort />
                SORT BY
              </button>

              {sortOpen && (
                <div
                  className="absolute top-[calc(100%+28px)] right-0 min-w-[260px] border border-solid rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-[10px] px-0 z-50 animate-[slideUp_200ms_ease-out]"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.borderColor }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className="sort-dropdown-item flex items-center gap-[12px] py-[8px] px-[20px] text-[15px] cursor-pointer"
                      style={{ color: theme.textColor }}
                      onClick={() => { updateParams({ sort: o.value }); setSortOpen(false); }}
                    >
                      <span
                        className={`w-[18px] h-[18px] rounded-full border-solid inline-block transition-all duration-200 ease-in-out ${
                          sort === o.value ? 'border-[5px]' : 'border-[2px]'
                        }`}
                        style={{
                          borderColor: sort === o.value ? theme.accentColor : theme.borderColor,
                        }}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[15px] font-medium min-w-[90px] text-right inline-flex items-center justify-end" style={{ color: theme.textColor }}>
              {filterLoading ? (
                <span className="filter-spinner w-[18px] h-[18px] border-[2px]" />
              ) : (
                <span className="animate-[filterFadeIn_400ms_ease]">
                  {data?.pagination ? `${data.pagination.totalProducts} products` : ''}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="shop-main-row flex gap-[40px] pb-[16px] min-[750px]:pb-[40px]">
          <div className="shop-sidebar w-[290px] shrink-0">
            <FilterSidebar
              filters={data?.filters || filtersDataRef.current}
              selectedFilters={{ search: searchQuery, category, subcategory, brand, color, size, availability }}
              onFilterChange={handleFilterChange}
              onBatchFilterChange={updateParams}
              priceRange={[minPrice, displayMaxPrice]}
              onPriceChange={handlePriceChange}
              onRemoveAll={() => {
                const params = new URLSearchParams();
                const view = searchParams.get('view');
                if (view) params.set('view', view);
                router.replace(`${basePath}?${params.toString()}`, { scroll: false });
              }}
            />
          </div>

          <div className="flex-1 relative">
            {filterLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="filter-spinner" />
              </div>
            )}

            <div
              className={`shop-grid grid gap-[24px] transition-opacity duration-[400ms] ease-in-out ${
                viewCols === 2 ? 'grid-cols-2' : viewCols === 3 ? 'grid-cols-3' : 'grid-cols-4'
              } ${filterLoading ? 'opacity-[0.15] min-h-[400px]' : 'opacity-100 min-h-auto'}`}
            >
              {isLoading ? (
                Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => <ProductSkeleton key={i} cardVariant={cardVariant} />)
              ) : (!data?.products || data.products.length === 0) ? (
                <div className="col-span-full py-[60px] text-center">
                  <p className="text-[20px] font-bold text-[#222] mb-[8px]">
                    {searchQuery ? `No products found for "${searchQuery}"` : 'No products found'}
                  </p>
                  <p className="text-[14px] text-[#666] mb-[24px]">
                    Try checking your spelling, using broader terms, or clearing filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      router.replace(basePath, { scroll: false });
                    }}
                    className="inline-flex items-center justify-center px-[22px] py-[11px] bg-[#222] text-white rounded-[6px] text-[14px] font-medium cursor-pointer hover:bg-[#444] transition-colors border-none"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                data.products.map((product, i) => (
                  renderCard ? (
                    <div key={product.id} className="min-w-0">{renderCard(product, i)}</div>
                  ) : (
                    <HomeProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      hrefBase={productHrefBase}
                      {...cardTheme}
                    />
                  )
                ))
              )}
            </div>

            {!filterLoading && data?.pagination && (
              <ShopPagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <div className="pt-[16px] pb-[20px] min-[750px]:pt-[36px] min-[750px]:pb-[48px]">
        <FeaturedSlider
          apiEndpoint={apiEndpoint}
          cardVariant={cardVariant}
          productHrefBase={productHrefBase}
          cardTheme={cardTheme}
        />
      </div>



      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={data?.filters || filtersDataRef.current}
        selected={{ availability, brand, color, size, category, subcategory, sort }}
        priceRange={[minPrice, displayMaxPrice]}
        productCount={data?.pagination?.totalProducts ?? 0}
        theme={{ accentColor: theme.accentColor, mutedColor: theme.mutedColor, textColor: theme.textColor }}
        onApply={(payload) => {
          const updates: Record<string, string> = {
            availability: payload.availability,
            brand: payload.brand,
            color: payload.color,
            size: payload.size,
            category: payload.category,
            subcategory: payload.subcategory,
            sort: payload.sort === 'featured' ? '' : payload.sort,
            minPrice: payload.minPrice > 0 ? String(payload.minPrice) : '',
            maxPrice: payload.maxPrice < (data?.filters?.priceRange.max ?? payload.maxPrice) ? String(payload.maxPrice) : '',
          };
          updateParams(updates);
        }}
        onRemoveAll={() => {
          const params = new URLSearchParams();
          const view = searchParams.get('view');
          if (view) params.set('view', view);
          router.push(`${basePath}?${params.toString()}`, { scroll: false });
        }}
      />

      <style>{`
        
        .shop-mobile-filter-btn {
          display: none;
        }
        @media (max-width: 749px) {
          .shop-view-toggles { display: none !important; }
          .shop-sort-dropdown { display: none !important; }
          .shop-mobile-filter-btn {
            display: inline-flex;
            align-items: center;
            
            gap: clamp(5px, 1.6vw, 8px);
            padding: clamp(7px, 2.2vw, 10px) clamp(12px, 4vw, 18px);
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: clamp(12px, 3.5vw, 15px);
            font-weight: 500;
            color: #222;
            cursor: pointer;
            white-space: nowrap;
            transition: background-color 180ms ease, border-color 180ms ease;
          }
          .shop-mobile-filter-btn svg {
            width: clamp(14px, 4.2vw, 18px);
            height: auto;
          }
          .shop-mobile-filter-btn:hover {
            background-color: #f4f4f4;
            border-color: #c9c9c9;
          }
          .shop-sidebar { display: none !important; }
          .shop-main-row { gap: 0 !important; }
        }

        
        @media (max-width: 991px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 18px !important;
          }
        }
        @media (max-width: 749px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }

        .sort-dropdown-item:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .filter-group-title:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .filter-checkbox-row:hover .filter-cb {
          border-color: #222 !important;
        }
        .filter-show-more:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .filter-remove-all:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .filter-tag-remove:hover {
          text-decoration: underline;
        }
        .filter-spinner {
          width: 24px;
          height: 24px;
          border: 2.5px solid #e0e0e0;
          border-top-color: #222;
          border-radius: 50%;
          animation: filterSpin 0.6s linear infinite;
        }
        @keyframes filterSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes filterFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </ShopThemeCtx.Provider>
  );
}
