import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  product?: any;
  productId?: string;
  variantId?: string;
  variantName?: string;
  name: string;
  slug?: string;
  image?: string;
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  subtotal?: number;
  vendor?: string;
  weight?: number;
}

export interface IOrderAddress {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface IStatusHistoryItem {
  status: string;
  changedAt: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer?: mongoose.Types.ObjectId;
  customerSnapshot: {
    name: string;
    email: string;
    phone?: string;
  };
  items: IOrderItem[];
  billingAddress: IOrderAddress;
  shippingAddress: IOrderAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  totalWeight?: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  statusHistory: IStatusHistoryItem[];
  notes?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderDocument = IOrder;

const AddressSubSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, default: '' },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.Mixed },
    productId: { type: String, default: '' },
    variantId: { type: String, default: '' },
    variantName: { type: String, default: '' },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    image: { type: String, default: '' },
    sku: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, default: 0 },
    vendor: { type: String, default: '' },
    weight: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    items: { type: [OrderItemSchema], default: [] },
    billingAddress: { type: AddressSubSchema, default: () => ({}) },
    shippingAddress: { type: AddressSubSchema, default: () => ({}) },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    totalWeight: { type: Number, default: 0 },
    paymentStatus: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
    status: { type: String, default: 'pending' },
    statusHistory: {
      type: [
        {
          status: { type: String },
          changedAt: { type: Date, default: Date.now },
          note: { type: String, default: '' },
        },
      ],
      default: [],
    },
    notes: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

OrderSchema.index({ orderNumber: 'text', 'customerSnapshot.name': 'text', 'customerSnapshot.email': 'text' });

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema, 'orders');

export default Order;
