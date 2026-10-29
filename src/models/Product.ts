import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  category?: mongoose.Types.ObjectId | string;
  subcategory?: string;
  price: number;
  salePrice?: number | null;
  sku?: string;
  images: string[];
  imageKeys?: string[];
  variants?: any[];
  specifications?: ISpecification[];
  stock: number;
  weight?: number;
  lowStockThreshold?: number;
  status: 'active' | 'draft' | 'archived';
  isFeatured?: boolean;
  totalSold?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    subcategory: { type: String, default: '' },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    sku: { type: String, default: '' },
    images: { type: [String], default: [] },
    imageKeys: { type: [String], default: [] },
    variants: { type: [Schema.Types.Mixed], default: [] },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    stock: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    isFeatured: { type: Boolean, default: false },
    totalSold: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Performance optimization: compound indexes for high-speed sorting and filtering in MongoDB
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ subcategory: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
