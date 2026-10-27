import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, signToken, AUTH_COOKIE_NAME, USER_COOKIE_NAME, ONE_DAY_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone } = body;

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 13) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const fullName = `${firstName.trim()} ${typeof lastName === 'string' ? lastName.trim() : ''}`.trim() || cleanEmail.split('@')[0];

    // Create user in customers collection
    const user = await User.create({
      name: fullName,
      firstName: firstName.trim(),
      lastName: typeof lastName === 'string' ? lastName.trim() : '',
      email: cleanEmail,
      password: hashedPassword,
      phone: typeof phone === 'string' ? phone.trim() : '',
      addresses: [],
      isVerified: false,
      isActive: true,
      totalOrders: 0,
      totalSpent: 0,
      role: 'customer',
    });

    // Generate JWT token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || `${user.firstName} ${user.lastName}`.trim(),
    });

    const userData = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userData,
        token,
      },
      { status: 201 }
    );

    // 1. HTTP-Only Auth Cookie for session verification (1 day = 86,400s)
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS,
    });

    // 2. Client-accessible User Cookie (1 day = 86,400s)
    response.cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_DAY_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
