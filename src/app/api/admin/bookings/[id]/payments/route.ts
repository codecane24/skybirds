import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const attempts = await Payment.find({ bookingId: id })
      .select('amount currency razorpayOrderId razorpayPaymentId status createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Admin payment attempts fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
