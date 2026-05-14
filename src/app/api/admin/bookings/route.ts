import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim() || '';
    const phone = searchParams.get('phone')?.trim() || '';
    const alternatePhone = searchParams.get('alternatePhone')?.trim() || '';

    if (!email && !phone && !alternatePhone) {
      return NextResponse.json({ pendingBookings: [] });
    }

    await connectDB();

    const clientQuery: any[] = [];
    if (email) clientQuery.push({ email });
    if (phone) {
      clientQuery.push({ phone });
      clientQuery.push({ alternatePhone: phone });
    }
    if (alternatePhone) {
      clientQuery.push({ phone: alternatePhone });
      clientQuery.push({ alternatePhone });
    }

    const clients = await Client.find({ $or: clientQuery }).select('_id name email phone alternatePhone').lean();
    if (!clients.length) {
      return NextResponse.json({ pendingBookings: [] });
    }

    const clientIds = clients.map((c: any) => c._id);
    const pendingBookings = await Booking.find({ clientId: { $in: clientIds }, status: 'pending' })
      .select('_id destination travelers totalAmount status paymentStatus createdAt clientId')
      .populate('clientId', 'name email phone')
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

    // Find or create client by email
    let client = await Client.findOne({ email: data.email });
    if (!client) {
      client = await Client.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone || '',
        password: Math.random().toString(36).slice(-8), // random password
        isVerified: true,
      });
    } else if (data.phone || data.alternatePhone) {
      await Client.findByIdAndUpdate(client._id, {
        ...(data.phone ? { phone: data.phone } : {}),
        ...(typeof data.alternatePhone === 'string' ? { alternatePhone: data.alternatePhone } : {}),
      });
    }

    const existingPending = await Booking.find({ clientId: client._id, status: 'pending' })
      .select('_id destination totalAmount createdAt')
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
      totalAmount: data.bookingAmount,
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
