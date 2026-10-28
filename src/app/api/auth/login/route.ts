import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken, AUTH_COOKIE_NAME, USER_COOKIE_NAME, ONE_DAY_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanEmail = email.toLowerCase().trim();
    // Since password has select: false in schema, explicitly select it
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Require email verification for customer accounts
    if (user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email address to log in. Please check your inbox for the activation link.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim(),
    });

    const userData = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',
        user: userData,
        token,
      },
      { status: 200 }
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
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
