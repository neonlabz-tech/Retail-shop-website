import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerAddress {
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface IWishlistItem {
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  image2?: string;
  slug: string;
  badge?: string | null;
  colors?: { name: string; value: string }[];
  vendor?: string;
  addedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: ICustomerAddress[];
  wishlist: IWishlistItem[];
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  activationToken?: string;
  activationTokenExpires?: Date;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ICustomerAddress>(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    image: { type: String, default: '' },
    image2: { type: String, default: '' },
    slug: { type: String, default: '' },
    badge: { type: String, default: null },
    colors: { type: Array, default: [] },
    vendor: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    wishlist: {
      type: [WishlistItemSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    activationToken: {
      type: String,
      select: false,
    },
    activationTokenExpires: {
      type: Date,
      select: false,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'customers', // Explicitly store in the shared 'customers' collection
  }
);

if (mongoose.models.Customer) {
  delete mongoose.models.Customer;
}
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const Customer: Model<IUser> =
  mongoose.models.Customer ||
  mongoose.model<IUser>('Customer', UserSchema, 'customers');

export const User = Customer;

export default User;
