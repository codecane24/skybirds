import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroSlide from '@/models/HeroSlide';
import { auth } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(slides);
}

import { saveUploadedImage } from '@/lib/upload';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';
  let data: Record<string, unknown>;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const image = formData.get('image');
    let imageUrl = String(formData.get('imageUrl') || '').trim();

    if (image instanceof File && image.size > 0) {
      imageUrl = await saveUploadedImage(image, 'hero');
    }

    data = {
      title: String(formData.get('title') || ''),
      subtitle: String(formData.get('subtitle') || ''),
      description: String(formData.get('description') || ''),
      ctaText: String(formData.get('ctaText') || ''),
      ctaLink: String(formData.get('ctaLink') || ''),
      location: String(formData.get('location') || ''),
      order: Number(formData.get('order') || 0),
      isActive: String(formData.get('isActive') || 'true') === 'true',
      imageUrl,
    };
  } else {
    data = await req.json();
  }

  await connectDB();
  const slide = await HeroSlide.create(data);
  return NextResponse.json(slide, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  await connectDB();
  const slide = await HeroSlide.findByIdAndUpdate(data._id, data, { new: true });
  return NextResponse.json(slide);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  await connectDB();
  await HeroSlide.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
