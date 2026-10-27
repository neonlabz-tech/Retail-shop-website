import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import { SITE_NAME } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Activation token is missing' },
        { status: 400 }
      );
    }

    return await handleActivation(token.trim());
  } catch (error: unknown) {
    console.error('Account activation error (GET):', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Activation token is required' },
        { status: 400 }
      );
    }

    return await handleActivation(token.trim());
  } catch (error: unknown) {
    console.error('Account activation error (POST):', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function handleActivation(token: string) {
  await connectDB();

  // Find customer with matching activation token
  const user = await User.findOne({ activationToken: token }).select(
    '+activationToken +activationTokenExpires'
  );

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or expired activation link. Your account may already be activated.',
      },
      { status: 400 }
    );
  }

  // Check if token has expired
  if (user.activationTokenExpires && new Date(user.activationTokenExpires) < new Date()) {
    return NextResponse.json(
      {
        success: false,
        error: 'This activation link has expired. Please request a new activation link.',
        expired: true,
      },
      { status: 400 }
    );
  }

  // Mark account as verified and clear token
  user.isVerified = true;
  user.activationToken = undefined;
  user.activationTokenExpires = undefined;
  await user.save();

  // Send official Welcome Email upon successful activation
  try {
    void sendEmail({
      to: user.email,
      subject: `Welcome to ${SITE_NAME || 'RKF Distributors'}!`,
      html: emailTemplates.welcome(user.firstName || user.name, user.email),
    });
  } catch (emailErr) {
    console.error('Failed to send welcome email after activation:', emailErr);
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Your account has been activated successfully! You can now log in.',
    },
    { status: 200 }
  );
}
