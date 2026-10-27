import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationItem {
  productId?: string;
  name: string;
  slug?: string;
  image?: string;
  reviewUrl: string;
  reviewed?: boolean;
}

export interface INotification extends Document {
  customer?: mongoose.Types.ObjectId;
  customerEmail: string;
  orderId?: mongoose.Types.ObjectId;
  orderNumber: string;
  type: 'order_delivered' | 'order_update' | 'general';
  title: string;
  message: string;
  items: INotificationItem[];
  read: boolean;
  isRead?: boolean;
  dismissed: boolean;
  emailSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationItemSchema = new Schema<INotificationItem>(
  {
    productId: { type: String, default: '' },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    image: { type: String, default: '' },
    reviewUrl: { type: String, required: true },
    reviewed: { type: Boolean, default: false },
  },
  { _id: false }
);

const NotificationSchema = new Schema<INotification>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    customerEmail: { type: String, required: false, lowercase: true, trim: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    orderNumber: { type: String, required: false, index: true },
    type: {
      type: String,
      // enum removed for admin notification compatibility
      default: 'order_delivered',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    items: { type: [NotificationItemSchema], default: [] },
    read: { type: Boolean, default: false, index: true },
    isRead: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false, index: true },
    emailSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

NotificationSchema.index({ customerEmail: 1, read: 1, createdAt: -1 });

if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema, 'notifications');

export default Notification;
