import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { User, ICustomerAddress } from '@/models/User';
import { Order } from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { generateNextOrderNumber } from '@/lib/orderNumber';
import { calculateShippingFee, parseWeightInGrams } from '@/utils/weight';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const orderNumber = request.nextUrl.searchParams.get('orderNumber')?.trim();

    // If an order number is provided, look up that specific order for tracking
    if (orderNumber) {
      const cleanNum = orderNumber.replace(/^#/, '');
      const escaped = cleanNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const order = await Order.findOne({
        orderNumber: { $regex: new RegExp(`^#?${escaped}$`, 'i') },
      }).lean();

      if (!order) {
        return NextResponse.json(
          { success: false, error: `Order #${orderNumber} not found. Please check the order number.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        order,
      });
    }

    // Otherwise, fetch all orders for the authenticated customer
    const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const tokenHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const token = tokenCookie || tokenHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to view your orders.' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const customer = await User.findById(payload.userId).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer account not found' },
        { status: 404 }
      );
    }

    const cleanEmail = customer.email?.toLowerCase().trim();

    const queryConditions: any[] = [{ customer: customer._id }];
    if (cleanEmail) {
      queryConditions.push({ 'customerSnapshot.email': cleanEmail });
    }

    const orders = await Order.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error: unknown) {
    console.error('Fetch orders error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      country,
      city,
      address,
      phone,
      email,
      notes,
      paymentMethod = 'cod',
      items = [],
      subtotal = 0,
      discount = 0,
      shippingFee = 350,
      tax = 0,
      total,
    } = body;

    // Validation
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return NextResponse.json(
        { success: false, error: 'Town/City is required' },
        { status: 400 }
      );
    }

    if (!country || typeof country !== 'string' || !country.trim()) {
      return NextResponse.json(
        { success: false, error: 'Country/Region is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanEmail = email.toLowerCase().trim();
    const fullName = `${firstName.trim()} ${typeof lastName === 'string' ? lastName.trim() : ''}`.trim() || cleanEmail.split('@')[0];

    // Check token from cookie or authorization header
    let userId: string | null = null;
    const token =
      request.cookies.get('auth_token')?.value ||
      (request.headers.get('authorization')?.startsWith('Bearer ')
        ? request.headers.get('authorization')?.substring(7)
        : null);

    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    // Require registered & authenticated customer - guests cannot place orders
    if (!userId) {
      // Check if this email is already registered in the system
      const registeredUser = await User.findOne({ email: cleanEmail });
      if (registeredUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email already exists. Please log in to complete your order.',
            requiresLogin: true,
          },
          { status: 401 }
        );
      }

      // Customer is not registered
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have a registered account. Only registered customers can order products. Please register an account first.',
          requiresRegistration: true,
        },
        { status: 401 }
      );
    }

    const customer = await User.findById(userId);
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer account not found. Please register or log in to place an order.',
          requiresRegistration: true,
        },
        { status: 401 }
      );
    }

    const orderAddress: ICustomerAddress = {
      label: 'Home',
      line1: address.trim(),
      city: city.trim(),
      country: country.trim(),
      isDefault: true,
    };

    // Update customer details if empty or updated
    if (firstName.trim()) customer.firstName = firstName.trim();
    if (typeof lastName === 'string' && lastName.trim()) customer.lastName = lastName.trim();
    if (phone.trim()) customer.phone = phone.trim();
    customer.name = fullName;

    // Update addresses list
    if (!Array.isArray(customer.addresses)) {
      customer.addresses = [];
    }

    // Demote existing defaults
    customer.addresses.forEach((a: ICustomerAddress) => {
      a.isDefault = false;
    });

    // Check if address already exists
    const existingIdx = customer.addresses.findIndex(
      (a: ICustomerAddress) =>
        a.line1?.trim().toLowerCase() === orderAddress.line1?.toLowerCase() &&
        a.city?.trim().toLowerCase() === orderAddress.city?.toLowerCase()
    );

    if (existingIdx >= 0) {
      customer.addresses[existingIdx] = {
        ...customer.addresses[existingIdx],
        ...orderAddress,
      };
    } else {
      customer.addresses.unshift(orderAddress);
    }

    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + Number(subtotal);

    await customer.save();

    let totalOrderWeightGrams = 0;
    const stockErrors: string[] = [];

    // Format items for order and resolve MongoDB product document IDs and weights
    const formattedItems = await Promise.all(
      items.map(async (item: any) => {
        let matchedProductDocId: mongoose.Types.ObjectId | undefined = undefined;
        let itemWeight = typeof item.weight === 'number' && item.weight > 0 ? item.weight : 0;
        const qty = Math.max(1, Number(item.quantity) || 1);

        try {
          const orCond: any[] = [];
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            orCond.push({ _id: new mongoose.Types.ObjectId(item.productId) });
          }
          if (item.slug && typeof item.slug === 'string') {
            orCond.push({ slug: item.slug.trim() });
          }
          if (item.sku && typeof item.sku === 'string') {
            orCond.push({ sku: item.sku.trim() });
          }
          if (orCond.length > 0) {
            const p = await Product.findOne({ $or: orCond }).lean();
            if (p) {
              matchedProductDocId = p._id as mongoose.Types.ObjectId;
              if (!itemWeight) {
                itemWeight = parseWeightInGrams(p);
              }
              // Validate stock limits
              if (typeof p.stock === 'number') {
                if (p.stock <= 0) {
                  stockErrors.push(`"${p.name || item.name}" is currently out of stock.`);
                } else if (p.stock < qty) {
                  stockErrors.push(`Only ${p.stock} units of "${p.name || item.name}" are available in stock (you requested ${qty}).`);
                }
              }
            }
          }
        } catch {}

        totalOrderWeightGrams += itemWeight * qty;

        return {
          product: matchedProductDocId,
          productId: item.productId || (matchedProductDocId ? matchedProductDocId.toString() : ''),
          name: item.name || 'Product',
          image: item.image || '',
          sku: item.sku || '',
          price: Number(item.price) || 0,
          quantity: qty,
          subtotal: (Number(item.price) || 0) * qty,
          weight: itemWeight,
        };
      })
    );

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: stockErrors.join(' '),
        },
        { status: 400 }
      );
    }

    // Shipping fee: 500 when order exceeds 500g, default 350 for all orders (0 if cart is empty)
    const calculatedShippingFee = calculateShippingFee(totalOrderWeightGrams, items.length);
    const finalShippingFee = typeof shippingFee === 'number' && !isNaN(shippingFee) && shippingFee > 0
      ? Number(shippingFee)
      : calculatedShippingFee;

    // Tax is removed as requested
    const finalTax = 0;

    const finalTotal = Math.max(
      0,
      (Number(subtotal) || 0) -
        (typeof discount === 'number' && !isNaN(discount) ? Number(discount) : 0) +
        finalShippingFee
    );

    const orderNumber = await generateNextOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: customer?._id,
      customerSnapshot: {
        name: fullName,
        email: cleanEmail,
        phone: phone.trim(),
      },
      items: formattedItems,
      billingAddress: {
        fullName,
        line1: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
      },
      shippingAddress: {
        fullName,
        line1: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
      },
      subtotal: Number(subtotal) || 0,
      discount: typeof discount === 'number' && !isNaN(discount) ? Number(discount) : 0,
      shippingFee: finalShippingFee,
      tax: 0,
      total: finalTotal,
      totalWeight: totalOrderWeightGrams,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod === 'bank' ? 'bank_transfer' : 'cod',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          note: 'Order placed by customer via store website',
        },
      ],
      notes: typeof notes === 'string' ? notes.trim() : '',
    });

    // ── Reduce product stock in DB by the count that customer ordered ──
    try {
      // Group quantities by product identifier in case multiple line items share the same product
      const productDeductions = new Map<string, { qty: number; item: any }>();

      for (const item of items) {
        const qty = Math.max(1, Math.round(Number(item.quantity) || 1));
        const key = (item.productId || item.slug || item.sku || item.name || '').trim();
        if (!key) continue;

        const existing = productDeductions.get(key);
        if (existing) {
          existing.qty += qty;
        } else {
          productDeductions.set(key, { qty, item });
        }
      }

      for (const { qty, item } of productDeductions.values()) {
        const orConditions: any[] = [];

        // 1. Match by Mongo ObjectId
        if (item.productId && typeof item.productId === 'string' && mongoose.Types.ObjectId.isValid(item.productId)) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(item.productId) });
        }

        // 2. Match by slug
        if (item.slug && typeof item.slug === 'string' && item.slug.trim()) {
          orConditions.push({ slug: item.slug.trim() });
        }

        // 3. Match by SKU
        if (item.sku && typeof item.sku === 'string' && item.sku.trim()) {
          orConditions.push({ sku: item.sku.trim() });
        }

        // 4. Fallback match by exact name
        if (orConditions.length === 0 && item.name && typeof item.name === 'string' && item.name.trim()) {
          orConditions.push({ name: item.name.trim() });
        }

        if (orConditions.length === 0) continue;

        // Find the product in MongoDB
        const productDoc = await Product.findOne({ $or: orConditions });
        if (productDoc) {
          const currentStock = typeof productDoc.stock === 'number' ? productDoc.stock : 0;
          const newStock = Math.max(0, currentStock - qty);

          await Product.updateOne(
            { _id: productDoc._id },
            {
              $set: { stock: newStock },
              $inc: { totalSold: qty },
            }
          );

          console.log(`[Inventory] Deducted ${qty} from "${productDoc.name}" (${productDoc.slug}). Stock: ${currentStock} -> ${newStock}, totalSold +${qty}`);
        } else {
          console.warn(`[Inventory] Product not found for stock deduction:`, {
            productId: item.productId,
            slug: item.slug,
            name: item.name,
          });
        }
      }
    } catch (stockError) {
      console.error('Failed to deduct product stock for order:', stockError);
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      discount: order.discount,
      shippingFee: order.shippingFee,
      tax: order.tax,
      paymentMethod: order.paymentMethod,
      customer: {
        id: customer._id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
      },
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
