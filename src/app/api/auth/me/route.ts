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
    const { firstName, lastName, phone } = body;

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

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
      message: 'Profile updated successfully',
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
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
