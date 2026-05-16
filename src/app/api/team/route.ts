import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';
import { saveUploadedImage } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === '1';

    if (showAll) {
      const session = await auth();
      if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await connectDB();
    const team = await TeamMember.find(showAll ? {} : { isActive: true }).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(team);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Team fetch error:', error.message, error.stack);
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    } else {
      console.error('Team fetch error:', error);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
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
        name: String(formData.get('name') || ''),
        designation: String(formData.get('designation') || ''),
        bio: String(formData.get('bio') || ''),
        imageUrl,
        accentColor: String(formData.get('accentColor') || '#2A7FD4'),
        isActive: String(formData.get('isActive') || 'true') === 'true',
        order: Number(formData.get('order') || 0),
      };
    } else {
      data = await req.json();
    }

    await connectDB();
    const teamMember = await TeamMember.create(data);
    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error('Team create error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMsg 
    }, { status: 500 });
  }
}
