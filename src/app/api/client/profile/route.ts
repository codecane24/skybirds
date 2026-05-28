import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import { normalizeCountryCode, sanitizePhoneNumber } from '@/lib/phone';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const client = await Client.findById(session.user.id).select('-password -verificationToken -tokenExpiry -resetToken -resetTokenExpiry');
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, countryCode, company, avatar } = await req.json();
    await connectDB();

    const client = await Client.findByIdAndUpdate(
      session.user.id,
      {
        name,
        phone: sanitizePhoneNumber(phone),
        countryCode: normalizeCountryCode(countryCode),
        company,
        avatar,
      },
      { new: true }
    ).select('-password -verificationToken -tokenExpiry -resetToken -resetTokenExpiry');

    return NextResponse.json(client);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
