import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewDocument extends Document {
  productId?: string;
  productSlug?: string;
  productName?: string;
  orderId?: string;
  orderDate?: Date;
  customerName?: string;
  customerEmail?: string;
  author: string;
  email?: string;
  rating: number;
  title?: string;
  body: string;
  comment?: string;
  images?: string[];
  likes?: number;
  verified: boolean;
  avatar?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: String, index: true },
    productSlug: { type: String, index: true },
    productName: { type: String, default: '' },
    orderId: { type: String, default: '', trim: true, index: true },
    orderDate: { type: Date, default: Date.now },
    customerName: { type: String, default: '', trim: true },
    customerEmail: { type: String, default: '', trim: true },
    author: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    title: { type: String, default: '', trim: true },
    body: { type: String, required: true, trim: true },
    comment: { type: String, default: '', trim: true },
    images: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ productSlug: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

if (mongoose.models.Review) {
  delete mongoose.models.Review;
}

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);

export default Review;
