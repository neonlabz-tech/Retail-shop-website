'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MongoCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  productCount: number;
}

export function CollectionsPageContent() {
  const [categories, setCategories] = useState<MongoCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error fetching live categories from MongoDB:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="bg-[rgb(247,248,252)] pt-[20px] pb-[40px] px-0 text-center">
        <div className="container-main">
          <div className="flex items-center justify-center gap-[8px] text-[14px] mb-[16px]">
            <Link href="/" className="text-[#777] underline underline-offset-[3px]">Home</Link>
            <span className="text-[#bbb]">/</span>
            <span className="text-[#222]">Collections</span>
          </div>
          <h1 className="text-[40px] font-semibold text-[#222]">Collections</h1>
        </div>
      </div>

      <div className="container-main pt-[50px] pb-[80px]">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[24px] gap-y-[40px]">
        {loading && categories.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="animate-shimmer w-full aspect-square rounded-[8px] mb-[14px]" />
                <div className="animate-shimmer h-[18px] w-[60%] mx-auto mt-0 mb-[8px] rounded-[4px]" />
                <div className="animate-shimmer h-[14px] w-[30%] my-0 mx-auto rounded-[4px]" />
              </div>
            ))
          : categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className="collection-card no-underline text-inherit text-center"
          >
            <div
              className="collection-card-img-wrap relative w-full aspect-square bg-[#eef2f6] rounded-[8px] border border-[#ededf0] overflow-hidden flex items-center justify-center shadow-[0_8px_16px_-2px_rgba(24,62,132,0.12),4px_6px_10px_-2px_rgba(24,62,132,0.04),-4px_6px_10px_-2px_rgba(24,62,132,0.04)] transition-[background-color,border-color,box-shadow] duration-300"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="collection-card-img object-cover object-center transition-transform duration-[400ms] ease-in-out"
                  sizes="(max-width: 749px) 100vw, (max-width: 991px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8fafc] text-[#888]">
                  <span className="text-[32px] mb-[8px]">📁</span>
                  <span className="text-[13px] font-medium">{category.name}</span>
                </div>
              )}
            </div>

            <h3 className="text-[20px] font-semibold text-[#222] mb-[4px] mt-[16px] transition-colors duration-200 ease-in-out">
              {category.name}
            </h3>

            <p className="text-[14px] text-[#888]">
              {category.productCount} Items
            </p>
          </Link>
        ))}
      </div>
    </div >

      <style>{`
        .collection-card .collection-card-img-wrap {
          background-color: #eef2f6;
          border-color: #ededf0;
          box-shadow: 0 8px 16px -2px rgba(24, 62, 132, 0.12), 4px 6px 10px -2px rgba(24, 62, 132, 0.04), -4px 6px 10px -2px rgba(24, 62, 132, 0.04);
          transition: background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
        }
        .collection-card:hover .collection-card-img-wrap {
          background-color: #e5ebf2;
          border-color: #e2e5ea;
          box-shadow: 0 10px 20px -2px rgba(24, 62, 132, 0.18), 4px 6px 12px -2px rgba(24, 62, 132, 0.06), -4px 6px 12px -2px rgba(24, 62, 132, 0.06);
        }
        .collection-card:hover .collection-card-img {
          transform: scale(1.08);
        }
        .collection-card:hover h3 {
          color: #F15B41 !important;
        }
      `}</style>
    </>
  );
}
