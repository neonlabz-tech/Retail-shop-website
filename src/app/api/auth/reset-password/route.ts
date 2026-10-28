import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';

/**
 * Pre-validates whether the reset token is still valid.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Reset token is missing' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired password reset link.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Validate reset token error (GET):', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}

/**
 * Resets the password using a valid reset token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired password reset link.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password reset link has expired. Please request a new link.',
          expired: true,
        },
        { status: 400 }
      );
    }

    // Hash the new password and clear the reset token
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Your password has been reset successfully! You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Reset password error (POST):', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
