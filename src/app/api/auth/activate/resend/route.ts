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

    const cleanEmail = email.toLowerCase().trim();
    await connectDB();

    const user = await User.findOne({ email: cleanEmail });

    // If user not found, respond with generic message for privacy
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, an activation link has been sent.',
        },
        { status: 200 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          alreadyVerified: true,
          message: 'Your account is already activated. You can log in directly.',
        },
        { status: 200 }
      );
    }

    // Generate fresh activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.activationToken = activationToken;
    user.activationTokenExpires = activationTokenExpires;
    await user.save();

    const origin = request.nextUrl.origin || 'https://rkfdistributors.lk';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const activationUrl = `${baseUrl}/activate?token=${activationToken}`;

    // Send Activation Email via Resend
    try {
      void sendEmail({
        to: cleanEmail,
        subject: `Activate Your ${SITE_NAME || 'RKF Distributors'} Account`,
        html: emailTemplates.accountActivation(user.firstName || user.name, activationUrl),
      });
    } catch (emailErr) {
      console.error('Failed to dispatch activation email:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'A new activation link has been sent to your email address.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Resend activation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
