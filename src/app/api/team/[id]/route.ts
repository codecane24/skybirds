import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';
import { deleteUploadedImageIfLocal, saveUploadedImage } from '@/lib/upload';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const teamMember = await TeamMember.findById(id);
    if (!teamMember) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Team fetch error:', error);
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
    const contentType = req.headers.get('content-type') || '';
    let data: Record<string, unknown>;

    await connectDB();
    const existing = await TeamMember.findById(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const image = formData.get('image');
      let imageUrl = String(formData.get('imageUrl') || existing.imageUrl || '').trim();

      if (image instanceof File && image.size > 0) {
        console.log('Processing image upload, size:', image.size, 'type:', image.type);
        try {
          imageUrl = await saveUploadedImage(image, 'team');
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          const errorMsg = uploadError instanceof Error ? uploadError.message : 'Upload failed';
          return NextResponse.json({ 
            error: 'Image upload failed', 
            details: errorMsg 
          }, { status: 500 });
        }
      }

      data = {
        name: String(formData.get('name') || existing.name),
        designation: String(formData.get('designation') || existing.designation),
        bio: String(formData.get('bio') || existing.bio || ''),
        imageUrl,
        accentColor: String(formData.get('accentColor') || existing.accentColor || '#2A7FD4'),
        isActive: String(formData.get('isActive') || String(existing.isActive)) === 'true',
        order: Number(formData.get('order') || existing.order || 0),
      };
    } else {
      data = await req.json();
    }

    const teamMember = await TeamMember.findByIdAndUpdate(id, data, { new: true });
    if (!teamMember) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const nextImageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : '';
    if (nextImageUrl && nextImageUrl !== existing.imageUrl) {
      await deleteUploadedImageIfLocal(existing.imageUrl);
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Team update error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMsg,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
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
    const existing = await TeamMember.findById(id);
    await TeamMember.findByIdAndDelete(id);
    if (existing?.imageUrl) {
      await deleteUploadedImageIfLocal(existing.imageUrl);
    }
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Team delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
