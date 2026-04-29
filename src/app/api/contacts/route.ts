import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { auth } from '@/lib/auth';
import { sendEmail, contactNotificationTemplate } from '@/lib/email';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Contacts fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { fullName, email } = data;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    await connectDB();
    const contact = await Contact.create(data);

    // Send notification email to admin with CC
    const adminEmail = process.env.ADMIN_EMAIL;
    const ccEmail = 'vikramsingh.vks06@gmail.com';
    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          cc: ccEmail,
          subject: `New Contact: ${fullName} — Sky Birds`,
          html: contactNotificationTemplate(data),
        });
      } catch {
        // Email failed but contact is saved
      }
    }

    return NextResponse.json({ message: 'Thank you! We will get back to you soon.', id: contact._id }, { status: 201 });
  } catch (error) {
    console.error('Contact create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
