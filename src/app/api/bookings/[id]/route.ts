import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import { auth } from '@/lib/auth';
import { normalizeCurrency } from '@/lib/currency';
import { getInrConversionRate } from '@/lib/exchange-rate';
import { normalizeCountryCode, sanitizePhoneNumber } from '@/lib/phone';

function normalizeBookingStatus<T extends { status?: string; paymentStatus?: string }>(booking: T): T {
  if (booking?.paymentStatus === 'paid' && ['pending', 'cancelled'].includes(booking?.status || '')) {
    return { ...booking, status: 'confirmed' };
  }
  return booking;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const booking = await Booking.findById(id).populate('clientId', 'name email company phone countryCode alternatePhone').lean();
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(normalizeBookingStatus(booking as any));
  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    await connectDB();

    const bookingRecord = await Booking.findById(id).select('clientId paymentStatus');
    if (!bookingRecord) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (
      bookingRecord.clientId &&
      (
        Object.prototype.hasOwnProperty.call(data, 'phone') ||
        Object.prototype.hasOwnProperty.call(data, 'alternatePhone') ||
        Object.prototype.hasOwnProperty.call(data, 'countryCode')
      )
    ) {
      const clientUpdate: Record<string, string> = {};
      const phone = sanitizePhoneNumber(data.phone);
      const alternatePhone = sanitizePhoneNumber(data.alternatePhone);
      const countryCode = normalizeCountryCode(data.countryCode);

      if (typeof data.phone === 'string') {
        clientUpdate.phone = phone;
        clientUpdate.countryCode = countryCode;
      }

      if (typeof data.alternatePhone === 'string') {
        clientUpdate.alternatePhone = alternatePhone;
      }

      if (!Object.keys(clientUpdate).length && typeof data.countryCode === 'string') {
        clientUpdate.countryCode = countryCode;
      }

      if (Object.keys(clientUpdate).length > 0) {
        await Client.findByIdAndUpdate(bookingRecord.clientId, clientUpdate);
      }

      delete data.phone;
      delete data.alternatePhone;
      delete data.countryCode;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'currency')) {
      data.currency = normalizeCurrency(data.currency);
      try {
        data.conversionRate = await getInrConversionRate(data.currency);
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch conversion rate' },
          { status: 502 }
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(data, 'totalAmount')) {
      data.totalAmount = Number(data.totalAmount);
      if (!Number.isFinite(data.totalAmount) || data.totalAmount < 0) {
        return NextResponse.json({ error: 'Booking amount must be a valid number' }, { status: 400 });
      }
    }

    if (data?.status && ['pending', 'cancelled'].includes(data.status)) {
      if (bookingRecord?.paymentStatus === 'paid') {
        return NextResponse.json(
          { error: 'Cannot set status to pending or cancelled after payment is paid' },
          { status: 400 }
        );
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, data, { new: true }).lean();
    return NextResponse.json(normalizeBookingStatus(booking as any));
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    await Booking.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Booking delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
