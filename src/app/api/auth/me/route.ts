import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME, USER_COOKIE_NAME, ONE_DAY_SECONDS } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Check cookie first, then Authorization header
    const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const authHeader = request.headers.get('authorization');
    const tokenHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const token = tokenCookie || tokenHeader;

    if (!token) {
      const res = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      res.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      res.cookies.set(USER_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      return res;
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      const res = NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
      res.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      res.cookies.set(USER_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      return res;
    }

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      const res = NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
      res.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      res.cookies.set(USER_COOKIE_NAME, '', { path: '/', maxAge: 0 });
      return res;
    }

    const userData = {
      id: user._id.toString(),
      firstName: user.firstName || (user.name ? user.name.split(' ')[0] : ''),
      lastName: user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      addresses: user.addresses || [],
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Keep user cookie synced with 1-day maxAge
    response.cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    console.error('Auth verification error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const authHeader = request.headers.get('authorization');
    const tokenHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const token = tokenCookie || tokenHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, action, address, addresses, index } = body;

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // 1. Basic profile updates
    if (typeof firstName === 'string') {
      user.firstName = firstName.trim();
    }
    if (typeof lastName === 'string') {
      user.lastName = lastName.trim();
    }
    if (typeof phone === 'string') {
      user.phone = phone.trim();
    }

    const combinedName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    if (combinedName) {
      user.name = combinedName;
    }

    // 2. Address array management
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    if (action === 'add_address' && address) {
      const isDef = Boolean(address.isDefault) || user.addresses.length === 0;
      if (isDef) {
        user.addresses.forEach((a) => {
          a.isDefault = false;
        });
      }
      user.addresses.push({
        label: typeof address.label === 'string' && address.label.trim() ? address.label.trim() : 'Home',
        line1: typeof address.line1 === 'string' ? address.line1.trim() : '',
        line2: typeof address.line2 === 'string' ? address.line2.trim() : '',
        city: typeof address.city === 'string' ? address.city.trim() : '',
        state: typeof address.state === 'string' ? address.state.trim() : '',
        postalCode: typeof address.postalCode === 'string' ? address.postalCode.trim() : '',
        country: typeof address.country === 'string' && address.country.trim() ? address.country.trim() : 'Sri Lanka',
        isDefault: isDef,
      });
      user.markModified('addresses');
    } else if (action === 'edit_address' && typeof index === 'number' && address) {
      if (user.addresses[index]) {
        const isDef = Boolean(address.isDefault);
        if (isDef) {
          user.addresses.forEach((a, i) => {
            a.isDefault = i === index;
          });
        }
        user.addresses[index].label = typeof address.label === 'string' && address.label.trim() ? address.label.trim() : user.addresses[index].label || 'Home';
        user.addresses[index].line1 = typeof address.line1 === 'string' ? address.line1.trim() : user.addresses[index].line1;
        user.addresses[index].line2 = typeof address.line2 === 'string' ? address.line2.trim() : user.addresses[index].line2;
        user.addresses[index].city = typeof address.city === 'string' ? address.city.trim() : user.addresses[index].city;
        user.addresses[index].state = typeof address.state === 'string' ? address.state.trim() : user.addresses[index].state;
        user.addresses[index].postalCode = typeof address.postalCode === 'string' ? address.postalCode.trim() : user.addresses[index].postalCode;
        user.addresses[index].country = typeof address.country === 'string' && address.country.trim() ? address.country.trim() : (user.addresses[index].country || 'Sri Lanka');
        if (isDef) {
          user.addresses[index].isDefault = true;
        }
        user.markModified('addresses');
      }
    } else if (action === 'delete_address' && typeof index === 'number') {
      if (user.addresses[index]) {
        const wasDefault = user.addresses[index].isDefault;
        user.addresses.splice(index, 1);
        if (wasDefault && user.addresses.length > 0) {
          user.addresses[0].isDefault = true;
        }
        user.markModified('addresses');
      }
    } else if (action === 'set_default_address' && typeof index === 'number') {
      if (user.addresses[index]) {
        user.addresses.forEach((a, i) => {
          a.isDefault = i === index;
        });
        user.markModified('addresses');
      }
    } else if (Array.isArray(addresses)) {
      user.addresses = addresses.map((addr: any) => ({
        label: typeof addr.label === 'string' && addr.label.trim() ? addr.label.trim() : 'Home',
        line1: typeof addr.line1 === 'string' ? addr.line1.trim() : '',
        line2: typeof addr.line2 === 'string' ? addr.line2.trim() : '',
        city: typeof addr.city === 'string' ? addr.city.trim() : '',
        state: typeof addr.state === 'string' ? addr.state.trim() : '',
        postalCode: typeof addr.postalCode === 'string' ? addr.postalCode.trim() : '',
        country: typeof addr.country === 'string' && addr.country.trim() ? addr.country.trim() : 'Sri Lanka',
        isDefault: Boolean(addr.isDefault),
      }));
      if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
        user.addresses[0].isDefault = true;
      }
      user.markModified('addresses');
    }

    await user.save();

    const userData = {
      id: user._id.toString(),
      firstName: user.firstName || (user.name ? user.name.split(' ')[0] : ''),
      lastName: user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      name: user.name || combinedName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      addresses: user.addresses || [],
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Updated successfully',
      user: userData,
    });

    response.cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    console.error('Update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
