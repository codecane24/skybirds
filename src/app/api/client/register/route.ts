import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import { sendEmail, verificationEmailTemplate } from '@/lib/email';
import { normalizeCountryCode, sanitizePhoneNumber } from '@/lib/phone';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, countryCode, company } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();

    const existing = await Client.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const client = await Client.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: sanitizePhoneNumber(phone),
      countryCode: normalizeCountryCode(countryCode),
      company: company || '',
      verificationToken,
      tokenExpiry,
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:4028';
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email.toLowerCase())}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your Sky Birds account',
        html: verificationEmailTemplate(name, verifyUrl),
      });
    } catch {
      // Email sending failed, but account is created
    }

    return NextResponse.json({
      message: 'Account created. Please check your email to verify your account.',
      clientId: client._id,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
