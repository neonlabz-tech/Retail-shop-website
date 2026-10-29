import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import { SITE_NAME } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
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

    await connectDB();

    const user = await User.findOne({ email: cleanEmail });

    // For security and privacy, always return success even if user is not found
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate secure crypto token for password reset (valid for 1 hour)
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Determine reset link URL
    const origin = request.nextUrl.origin || 'https://rkfdistributors.lk';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const resetUrl = `${baseUrl}/reset-password?token=${resetPasswordToken}`;

    // Send Password Reset Email via Resend
    try {
      void sendEmail({
        to: cleanEmail,
        subject: `Reset Your ${SITE_NAME || 'RKF Distributors'} Password`,
        html: emailTemplates.passwordReset(user.firstName || user.name, resetUrl),
      });
    } catch (emailErr) {
      console.error('Failed to dispatch password reset email via Resend:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
