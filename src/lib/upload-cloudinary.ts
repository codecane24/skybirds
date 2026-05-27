// Cloud-based upload solution using Cloudinary
// Install: npm install cloudinary

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (call once at startup or in each upload function)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

export async function saveUploadedImage(file: File, subDir: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const originalName = sanitizeFileName(file.name || 'image');
  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'image';
  const publicId = `${subDir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}`;

  // Upload to Cloudinary
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `skybirds/${subDir}`,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error: unknown, result?: { secure_url?: string }) => {
        if (error) reject(error);
        else if (result?.secure_url) resolve({ secure_url: result.secure_url });
        else reject(new Error('Cloudinary upload did not return a URL'));
      }
    );
    uploadStream.end(buffer);
  });

  return result.secure_url;
}

export async function deleteUploadedImageIfLocal(imagePath?: string): Promise<void> {
  if (!imagePath) return;
  
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/xxx/image/upload/v123/skybirds/team/filename.jpg
  const cloudinaryPattern = /cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.*)/;
  const match = imagePath.match(cloudinaryPattern);
  
  if (match && match[1]) {
    const publicId = match[1].replace(/\.[^/.]+$/, ''); // Remove extension
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      // Ignore errors to keep operations resilient
    }
  }
}
