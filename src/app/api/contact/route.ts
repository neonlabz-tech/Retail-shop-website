import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendEmail, emailTemplates } from '@/lib/email';
import { STORE_EMAIL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, comment, subject } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    const db = conn.connection.db;
    if (!db) {
      throw new Error('Database connection unavailable');
    }

    const doc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      comment: comment ? String(comment).trim() : '',
      subject: subject ? String(subject).trim() : 'Website Contact Form',
      createdAt: new Date(),
      status: 'unread',
    };

    await db.collection('contact_messages').insertOne(doc);

    // Send email notification to store owner via Resend
    try {
      void sendEmail({
        to: STORE_EMAIL,
        subject: `[Contact Inquiry] ${doc.subject} - from ${doc.name}`,
        html: emailTemplates.contactNotification(doc),
        replyTo: doc.email,
      });
    } catch (emailErr) {
      console.error('Failed to send contact notification email via Resend:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    });
  } catch (err: any) {
    console.error('Error in /api/contact:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
