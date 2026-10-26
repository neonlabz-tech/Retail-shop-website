import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import { Order } from '@/models/Order';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { AUTH_COOKIE_NAME, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const slug = searchParams.get('slug') || searchParams.get('productSlug');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30')));

    await connectDB();

    const query: Record<string, any> = {
      status: 'approved',
    };

    if (productId || slug) {
      const orConditions: any[] = [];
      if (productId) orConditions.push({ productId });
      if (slug) orConditions.push({ productSlug: slug });
      query.$or = orConditions;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const formattedReviews = reviews.map((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      starCounts[star] = (starCounts[star] || 0) + 1;

      return {
        id: r._id.toString(),
        productId: r.productId || '',
        productSlug: r.productSlug || '',
        productName: r.productName || '',
        author: r.author || r.customerName || 'Customer',
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        title: r.title || '',
        body: r.body || r.comment || '',
        images: Array.isArray(r.images) ? r.images : [],
        likes: r.likes || 0,
        verified: r.verified ?? true,
        avatar: r.avatar || '',
        createdAt: r.createdAt,
      };
    });

    const totalCount = formattedReviews.length;
    const averageRating =
      totalCount > 0
        ? Number(
            (
              formattedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) /
              totalCount
            ).toFixed(1)
          )
        : 5;

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      totalCount,
      averageRating,
      starCounts,
    });
  } catch (error: any) {
    console.error('Error in /api/reviews GET:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Check if this is a like action
    if (body.action === 'like' && body.reviewId) {
      const updated = await Review.findByIdAndUpdate(
        body.reviewId,
        { $inc: { likes: 1 } },
        { new: true }
      );
      return NextResponse.json({ success: true, likes: updated?.likes || 1 });
    }

    const { productId, productSlug, productName, rating, title, comment, images, orderId } = body;

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json(
        { success: false, error: 'Review message is required' },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const tokenCookie =
      request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const tokenHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenCookie || tokenHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Please log in to review a delivered order.' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Your session has expired. Please log in again.' },
        { status: 401 }
      );
    }

    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Please log in to review a delivered order.' },
        { status: 401 }
      );
    }

    const customer = await User.findById(payload.userId).lean();
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'A customer account is required to submit a review.' },
        { status: 403 }
      );
    }

    const customerEmail = customer.email.toLowerCase().trim();
    const customerName =
      customer.name?.trim() ||
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
      customerEmail.split('@')[0];
    const cleanProductId = productId ? String(productId).trim() : '';
    const cleanProductSlug = productSlug ? String(productSlug).trim().toLowerCase() : '';
    const cleanProductName = productName ? String(productName).trim() : '';

    if (!cleanProductId && !cleanProductSlug) {
      return NextResponse.json(
        { success: false, error: 'Product details are required to submit a review.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderId ? String(orderId).replace(/^#/, '').trim() : '';
    const orderConditions: Record<string, unknown>[] = [
      {
        $or: [
          { customer: customer._id },
          { 'customerSnapshot.email': customerEmail },
        ],
      },
      {
        $or: [
          ...(cleanProductId
            ? [
                { 'items.productId': cleanProductId },
                { 'items.product': cleanProductId },
              ]
            : []),
          ...(cleanProductSlug ? [{ 'items.slug': cleanProductSlug }] : []),
          ...(cleanProductName
            ? [{
                'items.name': new RegExp(
                  `^${cleanProductName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
                  'i'
                ),
              }]
            : []),
        ],
      },
    ];

    const orderQuery: Record<string, unknown> = { $and: orderConditions };
    if (cleanOrderNumber) {
      const escapedOrderNumber = cleanOrderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orderQuery.orderNumber = { $regex: new RegExp(`^#?${escapedOrderNumber}$`, 'i') };
    } else {
      orderQuery.status = 'delivered';
    }

    const order = await Order.findOne(orderQuery).sort({ createdAt: -1 }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'We could not find an order with that number.' },
        { status: 404 }
      );
    }

    const ownsOrder =
      String(order.customer || '') === String(customer._id) ||
      order.customerSnapshot.email?.toLowerCase().trim() === customerEmail;
    if (!ownsOrder) {
      return NextResponse.json(
        { success: false, error: 'This order does not belong to your account.' },
        { status: 403 }
      );
    }

    if (order.status?.toLowerCase().trim() !== 'delivered') {
      return NextResponse.json(
        { success: false, error: 'You can review products after the order is delivered.' },
        { status: 400 }
      );
    }

    const orderedItem = order.items.find((item) => {
      const itemProductId = String(item.productId || item.product || '').trim();
      const itemSlug = String(item.slug || '').trim().toLowerCase();
      return (
        (cleanProductId && itemProductId === cleanProductId) ||
        (cleanProductSlug && itemSlug === cleanProductSlug) ||
        (cleanProductName &&
          item.name.trim().toLowerCase() === cleanProductName.toLowerCase())
      );
    });

    if (!orderedItem) {
      return NextResponse.json(
        { success: false, error: 'This product is not part of the selected order.' },
        { status: 400 }
      );
    }

    const finalOrderId = order.orderNumber;
    const finalOrderDate = order.createdAt;
    const finalProductId = orderedItem.productId || cleanProductId || '';
    const finalProductSlug = orderedItem.slug || cleanProductSlug || '';

    const existingReview = await Review.findOne({
      orderId: finalOrderId,
      customerEmail,
      $or: [
        ...(finalProductId ? [{ productId: finalProductId }] : []),
        ...(finalProductSlug ? [{ productSlug: finalProductSlug }] : []),
      ],
    }).lean();

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product for this order.' },
        { status: 409 }
      );
    }

    const newReview = await Review.create({
      productId: finalProductId,
      productSlug: finalProductSlug,
      productName: productName ? String(productName).trim() : orderedItem.name,
      orderId: finalOrderId,
      orderDate: finalOrderDate,
      customerName,
      customerEmail,
      author: customerName,
      email: customerEmail,
      rating: numericRating,
      title: title ? String(title).trim() : '',
      body: comment.trim(),
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      likes: 0,
      verified: Boolean(finalOrderId),
      status: 'pending',
    });

    try {
      const notificationItemMatch = [
        ...(finalProductId ? [{ productId: finalProductId }] : []),
        ...(finalProductSlug ? [{ slug: finalProductSlug }] : []),
        { name: orderedItem.name },
      ];
      await Notification.updateMany(
        {
          orderNumber: order.orderNumber,
          customerEmail,
          type: 'order_delivered',
          items: { $elemMatch: { $or: notificationItemMatch } },
        },
        { $set: { 'items.$[reviewItem].reviewed': true } },
        {
          arrayFilters: [
            {
              $or: notificationItemMatch.map((match) => {
                const [field, value] = Object.entries(match)[0];
                return { [`reviewItem.${field}`]: value };
              }),
            },
          ],
        }
      );
    } catch (notificationError) {
      console.error('Failed to update delivered notification review status:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully! It will appear on the website once approved by an admin.',
      review: {
        id: newReview._id.toString(),
        productId: newReview.productId,
        productSlug: newReview.productSlug,
        productName: newReview.productName,
        author: newReview.author,
        rating: newReview.rating,
        date: new Date(newReview.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        title: newReview.title,
        body: newReview.body,
        images: newReview.images || [],
        likes: 0,
        verified: newReview.verified,
        status: newReview.status,
        createdAt: newReview.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/reviews POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
