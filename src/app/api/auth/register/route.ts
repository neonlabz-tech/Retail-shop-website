import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { SITE_NAME } from '@/lib/constants';

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

    // Generate secure email activation token (valid for 24 hours)
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user in customers collection (unverified until email activation)
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
      activationToken,
      activationTokenExpires,
      totalOrders: 0,
      totalSpent: 0,
      role: 'customer',
    });

    // Determine activation link URL
    const origin = request.nextUrl.origin || 'https://rkfdistributors.lk';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const activationUrl = `${baseUrl}/activate?token=${activationToken}`;

    // Send Activation Email via Resend
    try {
      void sendEmail({
        to: cleanEmail,
        subject: `Activate Your ${SITE_NAME || 'RKF Distributors'} Account`,
        html: emailTemplates.accountActivation(user.firstName || fullName, activationUrl),
      });
    } catch (emailErr) {
      console.error('Failed to dispatch activation email via Resend:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email and click the activation link to verify your account.',
        requiresVerification: true,
        email: cleanEmail,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
