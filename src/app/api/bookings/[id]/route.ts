import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';

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
    const booking = await Booking.findById(id).populate('clientId', 'name email company phone').lean();
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
    if (data?.status && ['pending', 'cancelled'].includes(data.status)) {
      const existing = await Booking.findById(id).select('paymentStatus');
      if (existing?.paymentStatus === 'paid') {
        return NextResponse.json(
          { error: 'Cannot set status to pending or cancelled after payment is paid' },
          { status: 400 }
        );
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
