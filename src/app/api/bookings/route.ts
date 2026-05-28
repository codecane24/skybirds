import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { auth } from '@/lib/auth';
import Client from '@/models/Client';
import { normalizeCountryCode, sanitizePhoneNumber } from '@/lib/phone';

function normalizeBookingStatus<T extends { status?: string; paymentStatus?: string }>(booking: T): T {
  if (booking?.paymentStatus === 'paid' && ['pending', 'cancelled'].includes(booking?.status || '')) {
    return { ...booking, status: 'confirmed' };
  }
  return booking;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (['admin', 'superadmin'].includes(session.user.role)) {
      const bookings = await Booking.find().populate('clientId', 'name email company phone countryCode alternatePhone').sort({ createdAt: -1 }).lean();

      const bookingIds = bookings.map((b: any) => b._id);
      const latestAttempts = await Payment.find({ bookingId: { $in: bookingIds } })
        .select('bookingId status createdAt razorpayOrderId razorpayPaymentId')
        .sort({ createdAt: -1 })
        .lean();

      const latestAttemptByBooking = new Map<string, any>();
      for (const attempt of latestAttempts as any[]) {
        const key = String(attempt.bookingId);
        if (!latestAttemptByBooking.has(key)) {
          latestAttemptByBooking.set(key, attempt);
        }
      }

      const result = bookings.map((b: any) => {
        const normalized = normalizeBookingStatus(b);
        const latest = latestAttemptByBooking.get(String(b._id));
        return {
          ...normalized,
          lastPaymentAttempt: latest
            ? {
                status: latest.status,
                createdAt: latest.createdAt,
                razorpayOrderId: latest.razorpayOrderId,
                razorpayPaymentId: latest.razorpayPaymentId,
              }
            : null,
        };
      });

      return NextResponse.json(result);
    }

    const bookings = await Booking.find({ clientId: session.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(bookings.map((b: any) => normalizeBookingStatus(b)));
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    const phone = sanitizePhoneNumber(data.phone);
    const countryCode = normalizeCountryCode(data.countryCode);

    if (phone) {
      await Client.findByIdAndUpdate(session.user.id, {
        phone,
        countryCode,
      });
    }

    const booking = await Booking.create({
      ...data,
      clientId: session.user.id,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
