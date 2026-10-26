'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

interface CategoriesCascadingMenuProps {
  onClose?: () => void;
  align?: 'left' | 'center';
}

export function CategoriesCascadingMenu({ onClose, align = 'left' }: CategoriesCascadingMenuProps) {
  const [categoriesList, setCategoriesList] = useState<CategoryTreeItem[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/categories')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.categories && Array.isArray(data.categories)) {
          const excludedNames = ['electronics', 'home & kitchen', 'fashion', 'sports & outdoors', 'test'];
          const filtered = data.categories.filter(
            (c: CategoryTreeItem) => !excludedNames.includes(c.name.trim().toLowerCase())
          );
          setCategoriesList(filtered);
        }
      })
      .catch((err) => {
        console.error('Error fetching categories from MongoDB:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`cat-cascading-menu absolute top-[calc(100%+8px)] w-[230px] min-h-[200px] bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] z-[350] before:content-[''] before:absolute before:-top-[12px] before:left-0 before:right-0 before:h-[12px] ${
        align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
      }`}
      onMouseLeave={() => setHoveredCategoryId(null)}
    >
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-[200px] text-[14px] text-[#888] italic">
          Loading categories...
        </div>
      ) : categoriesList.length === 0 ? (
        <div className="flex items-center justify-center w-full h-[200px] text-[14px] text-[#888]">
          No categories found in database.
        </div>
      ) : (
        <div className="w-full py-[10px] flex flex-col relative">
          {categoriesList.map((cat) => {
            const isHovered = cat.id === hoveredCategoryId;
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategoryId(cat.id)}
                className={`relative flex items-center justify-between px-[20px] py-[11px] cursor-pointer transition-colors duration-150 ${
                  isHovered ? 'bg-[#f8f9fa]' : 'bg-transparent'
                }`}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={onClose}
                  className={`text-[15px] no-underline flex-1 transition-colors duration-150 ${
                    isHovered ? 'font-semibold text-[#F15B41]' : 'font-medium text-[#222]'
                  }`}
                >
                  {cat.name}
                </Link>
                {hasSubs && (
                  <span
                    className={`text-[14px] font-semibold pl-[8px] transition-colors duration-150 ${
                      isHovered ? 'text-[#F15B41]' : 'text-[#bbb]'
                    }`}
                  >
                    ›
                  </span>
                )}

                {isHovered && hasSubs && (
                  <div className="cat-flyout-subpanel absolute top-[-6px] left-full w-[240px] bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_10px_28px_rgba(0,0,0,0.12)] px-[18px] py-[12px] flex flex-col z-[351] before:content-[''] before:absolute before:top-0 before:-left-[12px] before:w-[12px] before:h-full">
                    <div className="flex flex-col gap-[10px]">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/products?subcategory=${encodeURIComponent(sub)}`}
                          onClick={onClose}
                          className="cat-sub-link block text-[14px] font-medium text-[#333] no-underline py-[4px] transition-all duration-150 hover:text-[#F15B41] hover:translate-x-[4px]"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoriesCascadingMenu;
