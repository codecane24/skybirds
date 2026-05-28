import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';
import { DEFAULT_CURRENCY, normalizeCurrency } from '@/lib/currency';
import { getInrConversionRate } from '@/lib/exchange-rate';
import { normalizeCountryCode, sanitizePhoneNumber } from '@/lib/phone';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim() || '';
    const phone = sanitizePhoneNumber(searchParams.get('phone'));
    const alternatePhone = sanitizePhoneNumber(searchParams.get('alternatePhone'));
    const countryCode = normalizeCountryCode(searchParams.get('countryCode'));

    if (!email && !phone && !alternatePhone) {
      return NextResponse.json({ pendingBookings: [] });
    }

    await connectDB();

    const clientQuery: any[] = [];
    if (email) clientQuery.push({ email });
    if (phone) {
      clientQuery.push({ phone, countryCode });
      clientQuery.push({ phone });
      clientQuery.push({ alternatePhone: phone });
    }
    if (alternatePhone) {
      clientQuery.push({ phone: alternatePhone, countryCode });
      clientQuery.push({ phone: alternatePhone });
      clientQuery.push({ alternatePhone });
    }

    const clients = await Client.find({ $or: clientQuery }).select('_id name email phone countryCode alternatePhone').lean();
    if (!clients.length) {
      return NextResponse.json({ pendingBookings: [] });
    }

    const clientIds = clients.map((c: any) => c._id);
    const pendingBookings = await Booking.find({ clientId: { $in: clientIds }, status: 'pending' })
      .select('_id destination travelers totalAmount currency conversionRate status paymentStatus createdAt clientId')
      .populate('clientId', 'name email phone countryCode')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ pendingBookings });
  } catch (error) {
    console.error('Admin booking duplicate check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    const phone = sanitizePhoneNumber(data.phone);
    const alternatePhone = sanitizePhoneNumber(data.alternatePhone);
    const countryCode = normalizeCountryCode(data.countryCode);

    const currency = normalizeCurrency(data.currency || DEFAULT_CURRENCY);
    const totalAmount = Number(data.bookingAmount);

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return NextResponse.json({ error: 'Booking amount must be a valid number' }, { status: 400 });
    }

    let conversionRate = 1;
    try {
      conversionRate = await getInrConversionRate(currency);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch conversion rate' },
        { status: 502 }
      );
    }

    // Find or create client by email
    let client = await Client.findOne({ email: data.email });
    if (!client) {
      client = await Client.create({
        name: data.name,
        email: data.email,
        phone,
        countryCode,
        alternatePhone,
        password: Math.random().toString(36).slice(-8), // random password
        isVerified: true,
      });
    } else if (phone || alternatePhone) {
      await Client.findByIdAndUpdate(client._id, {
        ...(phone ? { phone, countryCode } : {}),
        ...(typeof data.alternatePhone === 'string' ? { alternatePhone } : {}),
      });
    }

    const existingPending = await Booking.find({ clientId: client._id, status: 'pending' })
      .select('_id destination totalAmount currency conversionRate createdAt')
      .sort({ createdAt: -1 })
      .lean();

    if (existingPending.length > 0 && !data.allowDuplicate) {
      return NextResponse.json(
        {
          error: 'Pending booking already exists for this client',
          pendingBookings: existingPending,
        },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      clientId: client._id,
      destination: data.destination,
      travelDate: new Date(), // TODO: add travelDate to form
      returnDate: new Date(), // TODO: add returnDate to form
      travelers: data.members,
      services: data.bookingTypes,
      totalAmount,
      currency,
      conversionRate,
      notes: data.description,
      status: 'pending',
      paymentStatus: 'pending',
      attachments: data.attachments || [],
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Admin booking create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
