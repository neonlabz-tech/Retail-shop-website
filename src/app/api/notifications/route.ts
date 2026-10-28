import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { Order, IOrder } from '@/models/Order';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getStorefrontOfProductId, getStorefrontOfSlug, productHrefBaseFor } from '@/utils/storefront';
import { FALLBACK_IMAGE_SRC, normalizeImageSrc } from '@/lib/imageFallback';
import { sendEmail, emailTemplates } from '@/lib/email';

const lastOrderSyncMap = new Map<string, number>();

function getStatusNotification(status: string, orderNumber: string) {
  if (status === 'delivered') {
    return {
      type: 'order_delivered' as const,
      title: `Order #${orderNumber} Delivered! 📦`,
      message:
        'Your package has been successfully delivered! We hope you love your items. Please take a moment to review your product and let us know your thoughts.',
    };
  }
  if (status === 'shipped') {
    return {
      type: 'order_update' as const,
      title: `Order #${orderNumber} Shipped! 🚚`,
      message: `Great news! Your package for order #${orderNumber} is on its way.`,
    };
  }
  if (status === 'processing') {
    return {
      type: 'order_update' as const,
      title: `Order #${orderNumber} Placed & Processing ⚙️`,
      message: `Thank you for your order! We received your order #${orderNumber} and it is currently being prepared for dispatch.`,
    };
  }
  if (status === 'confirmed') {
    return {
      type: 'order_update' as const,
      title: `Order #${orderNumber} Confirmed ✅`,
      message: `Your order #${orderNumber} has been confirmed.`,
    };
  }
  if (status === 'out_for_delivery') {
    return {
      type: 'order_update' as const,
      title: `Order #${orderNumber} Out for Delivery 🛵`,
      message: `Your order #${orderNumber} is out for delivery.`,
    };
  }
  if (status === 'cancelled') {
    return {
      type: 'order_update' as const,
      title: `Order #${orderNumber} Cancelled ❌`,
      message: `Your order #${orderNumber} has been cancelled. Please contact support if you have any questions.`,
    };
  }
  return {
    type: 'order_update' as const,
    title: `Order #${orderNumber} Status Updated`,
    message: `Your order #${orderNumber} status is now ${status.replace(/_/g, ' ')}.`,
  };
}

function getStatusChangedAt(order: Pick<IOrder, 'status' | 'statusHistory' | 'createdAt'>): Date {
  const currentStatus = String(order.status || '').toLowerCase().trim();
  const latestMatchingChange = [...(order.statusHistory || [])]
    .reverse()
    .find((change) => String(change.status || '').toLowerCase().trim() === currentStatus);
  const date = new Date(latestMatchingChange?.changedAt || order.createdAt);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

async function buildReviewItems(order: Pick<IOrder, 'items' | 'orderNumber'>) {
  return Promise.all(
    (order.items || []).map(async (item) => {
      const embeddedProduct =
        item.product && typeof item.product === 'object' ? item.product : null;
      const productId =
        item.productId ||
        (item.product ? String(embeddedProduct?._id || item.product) : '');
      let slug = item.slug || embeddedProduct?.slug || '';
      let product = null;

      if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).select('_id slug images').lean();
      }
      if (!product && item.sku) {
        product = await Product.findOne({ sku: item.sku }).select('_id slug images').lean();
      }
      if (!product && item.name) {
        const escapedName = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        product = await Product.findOne({
          name: new RegExp(`^${escapedName}$`, 'i'),
        }).select('_id slug images').lean();
      }

      const resolvedProductId = product?._id.toString() || productId;
      slug = slug || product?.slug || '';
      const routeKey = slug || resolvedProductId || item.name;
      const base = slug
        ? productHrefBaseFor(getStorefrontOfSlug(slug))
        : resolvedProductId
          ? productHrefBaseFor(getStorefrontOfProductId(resolvedProductId))
          : productHrefBaseFor('fashion');
      if (!routeKey) return null;

      return {
        productId: resolvedProductId,
        name: item.name,
        slug,
        image:
          normalizeImageSrc(product?.images?.[0]) ||
          normalizeImageSrc(embeddedProduct?.images?.[0]) ||
          normalizeImageSrc(item.image) ||
          FALLBACK_IMAGE_SRC,
        reviewUrl: `${base}/${encodeURIComponent(routeKey)}?writeReview=true&orderNumber=${encodeURIComponent(order.orderNumber)}#reviews`,
      };
    })
  ).then((items) => items.filter((item): item is NonNullable<typeof item> => item !== null));
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Authenticate user via token cookie or header
    const tokenCookie =
      request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const tokenHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenCookie || tokenHeader;

    let customerId: string | null = null;
    let customerEmail: string | null = null;

    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload?.userId) {
          const user = await User.findById(payload.userId).lean();
          if (user) {
            customerId = user._id.toString();
            customerEmail = user.email ? user.email.toLowerCase().trim() : null;
          }
        }
      } catch {
        // Token invalid, fallback to query param or cookies
      }
    }

    // 2. Fallback: check customer_user cookie
    if (!customerEmail) {
      try {
        const rawUserCookie = request.cookies.get('customer_user')?.value;
        if (rawUserCookie) {
          const parsed = JSON.parse(decodeURIComponent(rawUserCookie));
          if (parsed?.email) customerEmail = parsed.email.toLowerCase().trim();
          if (parsed?.id && !customerId) customerId = String(parsed.id);
        }
      } catch {}
    }

    // 3. Fallback: check query param email
    if (!customerEmail) {
      const paramEmail = request.nextUrl.searchParams.get('email')?.toLowerCase().trim();
      if (paramEmail) customerEmail = paramEmail;
    }

    if (!customerId && !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer identity is required to fetch notifications' },
        { status: 401 }
      );
    }

    // 1. Build customer notification query conditions
    const orConditions: any[] = [];
    if (customerId) {
      orConditions.push({ customer: customerId });
      if (mongoose.Types.ObjectId.isValid(customerId)) {
        orConditions.push({ customer: new mongoose.Types.ObjectId(customerId) });
      }
    }

    if (customerEmail) {
      const cleanEmail = customerEmail.toLowerCase().trim();
      orConditions.push({ customerEmail: cleanEmail });
      orConditions.push({
        customerEmail: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });

      if (!customerId) {
        try {
          const matchedUser = await User.findOne({
            email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          }).select('_id').lean();
          if (matchedUser?._id) {
            orConditions.push({ customer: matchedUser._id.toString() });
            orConditions.push({ customer: matchedUser._id });
          }
        } catch {}
      }
    }

    // 2. Query stored notifications first (Indexed, fast ~10ms)
    let storedNotifications = await Notification.find({
      $or: orConditions,
      dismissed: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // In-memory lookup map of existing notifications
    const existingMap = new Map<string, any>();
    const setLatestNotification = (key: string, notification: any) => {
      const existing = existingMap.get(key);
      if (
        !existing ||
        new Date(notification.createdAt).getTime() > new Date(existing.createdAt).getTime()
      ) {
        existingMap.set(key, notification);
      }
    };
    for (const notif of storedNotifications) {
      const ordNum = String(notif.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
      const title = String(notif.title || '').trim().toLowerCase();
      if (ordNum && title) {
        setLatestNotification(`${ordNum}:${title}`, notif);
      }
    }

    // 3. Fast check recent orders for this customer (Indexed on email / customer)
    const orderConditions: Record<string, unknown>[] = [];
    if (customerId) {
      orderConditions.push({ customer: customerId });
      if (mongoose.Types.ObjectId.isValid(customerId)) {
        orderConditions.push({ customer: new mongoose.Types.ObjectId(customerId) });
      }
    }
    if (customerEmail) {
      const cleanEmail = customerEmail.toLowerCase().trim();
      orderConditions.push({
        'customerSnapshot.email': new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });
    }

    const customerOrders = orderConditions.length
      ? await Order.find({ $or: orderConditions })
          .where('status')
          .nin(['', 'pending'])
          .select('orderNumber status customer customerSnapshot items createdAt updatedAt statusHistory subtotal discount shippingFee total paymentMethod')
          .sort({ updatedAt: -1 })
          .lean()
      : [];

    const recentOrderIds = customerOrders.map((order) => order._id);
    const recentOrderNumbers = customerOrders
      .map((order) => String(order.orderNumber || '').trim().replace(/^#/, ''))
      .filter(Boolean);
    if (recentOrderIds.length > 0 || recentOrderNumbers.length > 0) {
      const dismissedOrderConditions: Record<string, unknown>[] = [];
      if (recentOrderIds.length > 0) {
        dismissedOrderConditions.push({ orderId: { $in: recentOrderIds } });
      }
      if (recentOrderNumbers.length > 0) {
        dismissedOrderConditions.push({
          orderNumber: {
            $in: recentOrderNumbers.flatMap((orderNumber) => [
              orderNumber,
              `#${orderNumber}`,
            ]),
          },
        });
      }
      const dismissedNotifications = await Notification.find({
        $and: [
          { $or: orConditions },
          { $or: dismissedOrderConditions },
          { dismissed: true },
        ],
      })
        .select('orderId orderNumber title dismissed createdAt')
        .lean();

      for (const notification of dismissedNotifications) {
        const orderNumber = String(notification.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
        const title = String(notification.title || '').trim().toLowerCase();
        if (orderNumber && title) {
          setLatestNotification(`${orderNumber}:${title}`, notification);
        }
      }
    }

    // 4. Synchronize any status changes into notifications in memory and DB
    for (const order of customerOrders) {
      const status = String(order.status || '').toLowerCase().trim();
      if (!status || status === 'pending') continue;

      const cleanOrderNumber = String(order.orderNumber || '').trim().replace(/^#/, '');
      const statusChangedAt = getStatusChangedAt(order);

      // Skip creating a new notification if status is processing and customer already has a placed / processing notification
      if (status === 'processing') {
        const existingPlacements = storedNotifications.filter((n) => {
          const ordNum = String(n.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
          const title = String(n.title || '').toLowerCase();
          return (
            ordNum === cleanOrderNumber.toLowerCase() &&
            (title.includes('placed') || title.includes('processing'))
          );
        });
        for (const notification of existingPlacements) {
          if (new Date(notification.createdAt).getTime() > statusChangedAt.getTime()) {
            notification.createdAt = statusChangedAt;
            await mongoose.connection.collection('notifications').updateOne(
              { _id: notification._id },
              { $set: { createdAt: statusChangedAt } }
            );
          }
        }
        if (existingPlacements.length > 0) {
          continue;
        }
      }

      const notificationContent = getStatusNotification(status, cleanOrderNumber);
      const lookupKey = `${cleanOrderNumber.toLowerCase()}:${notificationContent.title.trim().toLowerCase()}`;
      const existingNotification = existingMap.get(lookupKey);

      if (
        existingNotification &&
        new Date(existingNotification.createdAt).getTime() > statusChangedAt.getTime()
      ) {
        existingNotification.createdAt = statusChangedAt;
        await mongoose.connection.collection('notifications').updateOne(
          { _id: existingNotification._id },
          { $set: { createdAt: statusChangedAt } }
        );
        const storedNotification = storedNotifications.find(
          (notification) => String(notification._id) === String(existingNotification._id)
        );
        if (storedNotification) storedNotification.createdAt = statusChangedAt;
      }

      if (
        existingNotification &&
        new Date(existingNotification.createdAt).getTime() >= statusChangedAt.getTime()
      ) {
        continue;
      }

      // New order status found in DB! Create customer notification
      const items = status === 'delivered' ? await buildReviewItems(order) : [];
      const orderCustomerEmail = order.customerSnapshot?.email?.toLowerCase().trim() || customerEmail || '';
      const notificationCustomer =
        order.customer ||
        (customerId && mongoose.Types.ObjectId.isValid(customerId)
          ? new mongoose.Types.ObjectId(customerId)
          : undefined);

      const created = await Notification.create({
        customer: notificationCustomer,
        customerEmail: orderCustomerEmail,
        orderId: order._id,
        orderNumber: cleanOrderNumber,
        ...notificationContent,
        items,
        read: false,
        isRead: false,
        dismissed: false,
        createdAt: statusChangedAt,
        updatedAt: statusChangedAt,
      });

      // Send Order Status Update Email via Resend when order transitions to Shipped, Delivered, etc.
      if (orderCustomerEmail && ['shipped', 'delivered', 'out_for_delivery', 'cancelled'].includes(status)) {
        try {
          const customerName = order.customerSnapshot?.name || 'Customer';
          const cleanNum = cleanOrderNumber;
          let subject = `Order #${cleanNum} Status: ${status.toUpperCase()}`;
          if (status === 'shipped') {
            subject = `Your Order #${cleanNum} Has Shipped! 🚚`;
          } else if (status === 'delivered') {
            subject = `Your Order #${cleanNum} Has Been Delivered! 📦`;
          } else if (status === 'processing') {
            subject = `Your Order #${cleanNum} Is In Processing ⚙️`;
          }

          void sendEmail({
            to: orderCustomerEmail,
            subject,
            html: emailTemplates.orderStatusUpdate(
              cleanNum,
              status,
              customerName,
              undefined,
              items,
              {
                subtotal: order.subtotal,
                shippingFee: order.shippingFee,
                discount: order.discount,
                total: order.total,
                paymentMethod: order.paymentMethod,
                items: order.items,
              }
            ),
          }).then((res) => {
            if (res.success) {
              Notification.updateOne({ _id: created._id }, { emailSent: true }).exec();
            }
          });
        } catch (emailErr) {
          console.error('Failed to dispatch status update email in notifications sync:', emailErr);
        }
      }

      const createdObj = (created as any).toObject ? (created as any).toObject() : created;
      setLatestNotification(lookupKey, createdObj);
      storedNotifications.unshift(createdObj);
    }

    // Consolidate "placed" and "processing" notifications for the same order into a single "Placed & Processing ⚙️" notification
    const placedProcessingByOrder = new Map<string, (typeof storedNotifications)[number][]>();
    for (const notification of storedNotifications) {
      const orderNumber = String(notification.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
      const title = String(notification.title || '').toLowerCase();
      if (orderNumber && (title.includes('placed') || title.includes('processing'))) {
        if (!placedProcessingByOrder.has(orderNumber)) {
          placedProcessingByOrder.set(orderNumber, []);
        }
        placedProcessingByOrder.get(orderNumber)!.push(notification);
      }
    }

    const mergedOutIds: any[] = [];
    for (const [ordNum, notifs] of placedProcessingByOrder.entries()) {
      if (notifs.length > 1) {
        // Sort newest first
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const primary = notifs[0];
        const displayOrderNum = primary.orderNumber ? String(primary.orderNumber).replace(/^#/, '') : ordNum.toUpperCase();
        const targetTitle = `Order #${displayOrderNum} Placed & Processing ⚙️`;
        const targetMessage = `Thank you for your order! We received your order #${displayOrderNum} and it is currently being prepared for dispatch.`;
        primary.title = targetTitle;
        primary.message = targetMessage;
        void Notification.updateOne(
          { _id: primary._id },
          { $set: { title: targetTitle, message: targetMessage } }
        ).catch(() => {});

        for (let i = 1; i < notifs.length; i++) {
          mergedOutIds.push(notifs[i]._id);
        }
      } else if (notifs.length === 1) {
        const single = notifs[0];
        const displayOrderNum = single.orderNumber ? String(single.orderNumber).replace(/^#/, '') : ordNum.toUpperCase();
        const targetTitle = `Order #${displayOrderNum} Placed & Processing ⚙️`;
        const targetMessage = `Thank you for your order! We received your order #${displayOrderNum} and it is currently being prepared for dispatch.`;
        if (single.title !== targetTitle) {
          single.title = targetTitle;
          single.message = targetMessage;
          void Notification.updateOne(
            { _id: single._id },
            { $set: { title: targetTitle, message: targetMessage } }
          ).catch(() => {});
        }
      }
    }

    if (mergedOutIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: mergedOutIds } });
      const mergedOutSet = new Set(mergedOutIds.map((id) => String(id)));
      storedNotifications = storedNotifications.filter((n) => !mergedOutSet.has(String(n._id)));
    }

    const uniqueNotifications = new Map<string, (typeof storedNotifications)[number]>();
    const duplicateIds: (typeof storedNotifications)[number]['_id'][] = [];
    for (const notification of storedNotifications) {
      const orderNumber = String(notification.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
      const key = orderNumber
        ? `${notification.type}:${orderNumber}:${notification.title.trim().toLowerCase()}`
        : `id:${notification._id.toString()}`;
      if (uniqueNotifications.has(key)) {
        duplicateIds.push(notification._id);
      } else {
        uniqueNotifications.set(key, notification);
      }
    }
    if (duplicateIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: duplicateIds } });
    }
    const notifications = [...uniqueNotifications.values()].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

    const deliveredNotifications = notifications.filter(
      (notification) => notification.type === 'order_delivered'
    );
    const customerEmails = [
      ...new Set(deliveredNotifications.map((notification) => notification.customerEmail.toLowerCase().trim())),
    ];
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailReviewConditions = customerEmails.flatMap((email) => {
      const pattern = new RegExp(`^${escapeRegex(email)}$`, 'i');
      return [{ customerEmail: pattern }, { email: pattern }];
    });
    const reviews = emailReviewConditions.length
      ? await Review.find({
          $or: emailReviewConditions,
        })
          .select('productId productSlug productName customerEmail email orderId')
          .lean()
      : [];

    const clean = (value?: string) => String(value || '').trim().toLowerCase();
    const cleanOrderNumber = (value?: string) =>
      clean(value).replace(/^#/, '');
    const notificationsWithReviewStatus = notifications.map((notification) => ({
      ...notification,
      items: (notification.items || []).map((item) => ({
        ...item,
        reviewed:
          item.reviewed ||
          reviews.some((review) => {
            const sameOrder =
              cleanOrderNumber(review.orderId) === cleanOrderNumber(notification.orderNumber);
            const sameCustomer =
              clean(review.customerEmail) === clean(notification.customerEmail) ||
              clean(review.email) === clean(notification.customerEmail);
            const sameProduct =
              (item.productId && clean(review.productId) === clean(item.productId)) ||
              (item.slug && clean(review.productSlug) === clean(item.slug)) ||
              (item.name && clean(review.productName) === clean(item.name));

            return sameOrder && sameCustomer && sameProduct;
          }),
      })),
    }));

    const unreadCount = notifications.filter((n) => !n.read && !(n as any).isRead).length;
    return NextResponse.json({
      success: true,
      notifications: notificationsWithReviewStatus,
      unreadCount,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { notificationId, markAllRead, dismiss, email } = body;

    if (markAllRead) {
      const tokenCookie =
        request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('auth_token')?.value;
      let targetEmail = email ? email.toLowerCase().trim() : null;

      if (tokenCookie && !targetEmail) {
        try {
          const payload = await verifyToken(tokenCookie);
          if (payload?.userId) {
            const user = await User.findById(payload.userId).lean();
            if (user?.email) targetEmail = user.email.toLowerCase().trim();
          }
        } catch {
          // Ignore
        }
      }

      if (targetEmail) {
        await Notification.updateMany(
          {
            $or: [
              { customerEmail: targetEmail },
              { customerEmail: new RegExp(`^${targetEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            ],
            read: false,
          },
          { $set: { read: true, isRead: true } }
        );
      } else {
        await Notification.updateMany({ read: false }, { $set: { read: true, isRead: true } });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      if (dismiss) {
        const tokenCookie =
          request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('auth_token')?.value;
        const authHeader = request.headers.get('authorization');
        const tokenHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        let customerId: string | null = null;
        let targetEmail = typeof email === 'string' ? email.toLowerCase().trim() : null;

        const token = tokenCookie || tokenHeader;
        if (token) {
          try {
            const payload = await verifyToken(token);
            if (payload?.userId) {
              const user = await User.findById(payload.userId).select('_id email').lean();
              if (user) {
                customerId = user._id.toString();
                targetEmail = user.email?.toLowerCase().trim() || targetEmail;
              }
            }
          } catch {
            // Continue with customer identity from the signed-in user cookie or request email.
          }
        }

        if (!customerId && !targetEmail) {
          try {
            const rawUserCookie = request.cookies.get('customer_user')?.value;
            if (rawUserCookie) {
              const parsed = JSON.parse(decodeURIComponent(rawUserCookie));
              if (parsed?.id) customerId = String(parsed.id);
              if (parsed?.email) targetEmail = String(parsed.email).toLowerCase().trim();
            }
          } catch {
            // No usable customer identity in the cookie.
          }
        }

        const ownerConditions: Record<string, unknown>[] = [];
        if (customerId) ownerConditions.push({ customer: customerId });
        if (targetEmail) {
          ownerConditions.push({
            customerEmail: new RegExp(
              `^${targetEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          });
        }

        if (ownerConditions.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Customer identity is required to dismiss a notification' },
            { status: 401 }
          );
        }

        const notification = await Notification.findOne({
          _id: notificationId,
          $or: ownerConditions,
        })
          .select('orderId orderNumber title')
          .lean();
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Notification not found' },
            { status: 404 }
          );
        }

        const sameOrderConditions: Record<string, unknown>[] = [];
        if (notification.orderId) sameOrderConditions.push({ orderId: notification.orderId });
        if (notification.orderNumber) {
          sameOrderConditions.push({ orderNumber: notification.orderNumber });
        }
        const dismissalResult = await Notification.updateMany(
          {
            $and: [
              { $or: ownerConditions },
              { $or: sameOrderConditions },
              { title: notification.title },
            ],
          },
          { $set: { dismissed: true, read: true, isRead: true } }
        );
        return NextResponse.json({
          success: true,
          dismissedCount: dismissalResult.modifiedCount,
        });
      }

      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { read: true, isRead: true } },
        { new: true }
      );
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json(
      { success: false, error: 'notificationId or markAllRead is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
