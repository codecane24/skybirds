import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroSlide from '@/models/HeroSlide';
import { auth } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/upload';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const slide = await HeroSlide.findById(params.id);
  if (!slide) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(slide);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const contentType = req.headers.get('content-type') || '';
  let data: Record<string, unknown> = {};

  await connectDB();
  const existing = await HeroSlide.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const image = formData.get('image');
    let imageUrl = String(formData.get('imageUrl') || existing.imageUrl || '').trim();
    if (image instanceof File && image.size > 0) {
      imageUrl = await saveUploadedImage(image, 'hero');
    }
    data = {
      title: formData.get('title') && String(formData.get('title')).trim() !== '' ? String(formData.get('title')) : existing.title,
      subtitle: formData.get('subtitle') && String(formData.get('subtitle')).trim() !== '' ? String(formData.get('subtitle')) : existing.subtitle,
      description: formData.get('description') && String(formData.get('description')).trim() !== '' ? String(formData.get('description')) : existing.description,
      ctaText: formData.get('ctaText') && String(formData.get('ctaText')).trim() !== '' ? String(formData.get('ctaText')) : existing.ctaText,
      ctaLink: formData.get('ctaLink') && String(formData.get('ctaLink')).trim() !== '' ? String(formData.get('ctaLink')) : existing.ctaLink,
      location: formData.get('location') && String(formData.get('location')).trim() !== '' ? String(formData.get('location')) : existing.location,
      order: formData.get('order') && String(formData.get('order')).trim() !== '' ? Number(formData.get('order')) : existing.order,
      isActive: String(formData.get('isActive') || String(existing.isActive)) === 'true',
      imageUrl,
    };
  } else {
    const body = await req.json();
    data = {
      title: body.title && String(body.title).trim() !== '' ? body.title : existing.title,
      subtitle: body.subtitle && String(body.subtitle).trim() !== '' ? body.subtitle : existing.subtitle,
      description: body.description && String(body.description).trim() !== '' ? body.description : existing.description,
      ctaText: body.ctaText && String(body.ctaText).trim() !== '' ? body.ctaText : existing.ctaText,
      ctaLink: body.ctaLink && String(body.ctaLink).trim() !== '' ? body.ctaLink : existing.ctaLink,
      location: body.location && String(body.location).trim() !== '' ? body.location : existing.location,
      order: typeof body.order !== 'undefined' && String(body.order).trim() !== '' ? body.order : existing.order,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : existing.isActive,
      imageUrl: body.imageUrl && String(body.imageUrl).trim() !== '' ? body.imageUrl : existing.imageUrl,
    };
  }
  const slide = await HeroSlide.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(slide);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  await HeroSlide.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
