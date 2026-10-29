import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import ProductModel from '@/models/Product';
import { formatMongoProduct } from '@/lib/formatProduct';
import type { FilterCounts } from '@/types/common';

interface CachedFilters {
  categories: FilterCounts[];
  subcategories: FilterCounts[];
  categorySubcategories: Record<string, FilterCounts[]>;
  brands: FilterCounts[];
  colors: FilterCounts[];
  sizes: FilterCounts[];
  availability: {
    inStock: number;
    outOfStock: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

let facetsCache: {
  timestamp: number;
  filters: CachedFilters;
} | null = null;
const FACETS_CACHE_TTL_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12'));
    const query = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory') || searchParams.get('subCategory');
    const status = searchParams.get('status');
    const brand = searchParams.get('brand');
    const availability = searchParams.get('availability') || searchParams.get('inStock');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') || searchParams.get('min_price')
      ? parseFloat((searchParams.get('minPrice') || searchParams.get('min_price'))!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice') || searchParams.get('max_price')
      ? parseFloat((searchParams.get('maxPrice') || searchParams.get('max_price'))!)
      : undefined;
    const isFeaturedParam = searchParams.get('featured') || searchParams.get('isFeatured');
    const isSaleParam = searchParams.get('sale') === 'true' || searchParams.get('onSale') === 'true';

    try {
      const conn = await connectDB();
      const db = conn.connection.db;

      const filter: Record<string, any> = { status: 'active' };
      const andConditions: any[] = [];

      if (isFeaturedParam === 'true') {
        filter.isFeatured = true;
      }

      if (isSaleParam) {
        andConditions.push({
          salePrice: { $gt: 0, $ne: null },
        });
      }

      if (query) {
        const sanitized = query.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').trim().replace(/\s+/g, '.*');
        const searchRegex = new RegExp(sanitized, 'i');
        andConditions.push({
          $or: [
            { name: { $regex: searchRegex } },
            { sku: { $regex: searchRegex } },
            { slug: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
            { subcategory: { $regex: searchRegex } },
          ],
        });
      }

      if (subcategory && subcategory !== 'all') {
        const subList = subcategory.split(',').map((s) => s.trim()).filter(Boolean);
        if (subList.length === 1) {
          andConditions.push({
            subcategory: { $regex: new RegExp(`^${subList[0]}$`, 'i') },
          });
        } else if (subList.length > 1) {
          andConditions.push({
            $or: subList.map((s) => ({ subcategory: { $regex: new RegExp(`^${s}$`, 'i') } })),
          });
        }
      }

      if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
          andConditions.push({ category: new mongoose.Types.ObjectId(category) });
        } else {
          let matchedCatIds: mongoose.Types.ObjectId[] = [];
          if (db) {
            const matchedCats = await db
              .collection('categories')
              .find({ name: { $regex: new RegExp(category, 'i') } })
              .toArray();
            matchedCatIds = matchedCats.map((c) => new mongoose.Types.ObjectId(c._id.toString()));
          }
          const orList: any[] = [
            { subcategory: { $regex: new RegExp(category, 'i') } },
          ];
          if (matchedCatIds.length > 0) {
            orList.push({ category: { $in: matchedCatIds } });
          }
          andConditions.push({ $or: orList });
        }
      }

      if (brand && brand !== 'all') {
        andConditions.push({ subcategory: { $regex: new RegExp(brand, 'i') } });
      }

      if (minPrice !== undefined && !isNaN(minPrice)) {
        andConditions.push({
          $or: [
            { salePrice: { $gte: minPrice, $ne: null } },
            {
              $and: [
                { $or: [{ salePrice: null }, { salePrice: 0 }, { salePrice: { $exists: false } }] },
                { price: { $gte: minPrice } },
              ],
            },
          ],
        });
      }

      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        andConditions.push({
          $or: [
            { salePrice: { $lte: maxPrice, $ne: null } },
            {
              $and: [
                { $or: [{ salePrice: null }, { salePrice: 0 }, { salePrice: { $exists: false } }] },
                { price: { $lte: maxPrice } },
              ],
            },
          ],
        });
      }

      if (availability) {
        const avail = availability.toLowerCase();
        if (avail === 'in-stock' || avail === 'in_stock' || avail === 'true') {
          andConditions.push({ stock: { $gt: 0 } });
        } else if (avail === 'out-of-stock' || avail === 'out_of_stock' || avail === 'false') {
          andConditions.push({
            $or: [{ stock: { $lte: 0 } }, { stock: null }, { stock: { $exists: false } }],
          });
        }
      }

      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }

      let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
      switch (sort) {
        case 'featured':
          sortQuery = { isFeatured: -1, createdAt: -1 };
          break;
        case 'name-asc':
        case 'title-asc':
        case 'alphabetical-asc':
          sortQuery = { name: 1 };
          break;
        case 'name-desc':
        case 'title-desc':
        case 'alphabetical-desc':
          sortQuery = { name: -1 };
          break;
        case 'price-asc':
        case 'price-low-to-high':
          sortQuery = { price: 1 };
          break;
        case 'price-desc':
        case 'price-high-to-low':
          sortQuery = { price: -1 };
          break;
        case 'date-asc':
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'rating':
        case 'popular':
          sortQuery = { totalSold: -1 };
          break;
        case 'newest':
        case 'date-desc':
        default:
          sortQuery = { createdAt: -1 };
          break;
      }

      const skip = (page - 1) * limit;

      const [totalProducts, mongoDocs] = await Promise.all([
        ProductModel.countDocuments(filter),
        ProductModel.find(filter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      const totalPages = Math.ceil(totalProducts / limit) || 1;
      const formattedProducts = mongoDocs.map(formatMongoProduct);

      let computedFilters: CachedFilters | null =
        facetsCache && Date.now() - facetsCache.timestamp < FACETS_CACHE_TTL_MS ? facetsCache.filters : null;

      if (!computedFilters) {
        const [allMatchingForFacets, mongoCats] = await Promise.all([
          ProductModel.find(
            { status: 'active' },
            'category subcategory price salePrice stock'
          ).lean(),
          db ? db.collection('categories').find({}).toArray() : Promise.resolve([]),
        ]);

        const catIdToName = new Map<string, string>();
        const categoriesCountMap = new Map<string, number>();
        const categorySubcategoriesMap = new Map<string, Map<string, number>>();

        mongoCats.forEach((c) => {
          catIdToName.set(c._id.toString(), c.name);
          categoriesCountMap.set(c.name, 0);
          categorySubcategoriesMap.set(c.name, new Map<string, number>());
        });

        const subcategoriesMap = new Map<string, number>();
        let minFound = Infinity;
        let maxFound = 0;
        let inStockCount = 0;
        let outOfStockCount = 0;

        allMatchingForFacets.forEach((doc) => {
          const catIdStr = doc.category ? doc.category.toString() : '';
          const catName = catIdToName.get(catIdStr);
          if (catName) {
            categoriesCountMap.set(catName, (categoriesCountMap.get(catName) ?? 0) + 1);
            if (doc.subcategory) {
              const subMap = categorySubcategoriesMap.get(catName);
              if (subMap) {
                subMap.set(doc.subcategory, (subMap.get(doc.subcategory) ?? 0) + 1);
              }
            }
          }

          const sub = doc.subcategory || 'General';
          subcategoriesMap.set(sub, (subcategoriesMap.get(sub) ?? 0) + 1);

          const effectivePrice = doc.salePrice && doc.salePrice > 0 ? doc.salePrice : doc.price;
          if (effectivePrice < minFound) minFound = effectivePrice;
          if (effectivePrice > maxFound) maxFound = effectivePrice;

          if ((doc.stock ?? 0) > 0) {
            inStockCount++;
          } else {
            outOfStockCount++;
          }
        });

        const categoriesList: FilterCounts[] = Array.from(categoriesCountMap.entries())
          .filter(([_, count]) => count > 0)
          .map(([name, count]) => ({
            name,
            count,
          }));

        const subcategoriesList: FilterCounts[] = Array.from(subcategoriesMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));

        const categorySubcategoriesRecord: Record<string, FilterCounts[]> = {};
        categorySubcategoriesMap.forEach((subMap, catName) => {
          categorySubcategoriesRecord[catName] = Array.from(subMap.entries()).map(([name, count]) => ({
            name,
            count,
          }));
        });

        computedFilters = {
          categories: categoriesList,
          subcategories: subcategoriesList,
          categorySubcategories: categorySubcategoriesRecord,
          brands: subcategoriesList,
          colors: [],
          sizes: [],
          availability: {
            inStock: inStockCount,
            outOfStock: outOfStockCount,
          },
          priceRange: {
            min: 0,
            max: maxFound,
          },
        };

        facetsCache = {
          timestamp: Date.now(),
          filters: computedFilters,
        };
      }

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit,
        },
        filters: computedFilters,
      });
    } catch (dbErr) {
      console.error('MongoDB query error in /api/products:', dbErr);
    }

    return NextResponse.json({
      products: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalProducts: 0,
        hasNext: false,
        hasPrev: false,
        limit,
      },
      filters: {
        subcategories: [],
        categories: [],
        brands: [],
        colors: [],
        sizes: [],
        availability: { inStock: 0, outOfStock: 0 },
        priceRange: { min: 0, max: 0 },
      },
    });
  } catch (error) {
    console.error('Error in /api/products GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
