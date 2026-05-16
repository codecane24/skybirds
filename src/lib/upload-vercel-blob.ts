// Vercel Blob upload solution
// Install: npm install @vercel/blob

import { put, del } from '@vercel/blob';
import path from 'path';

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
  
  const originalName = sanitizeFileName(file.name || 'image');
  const ext = path.extname(originalName) || '.png';
  const baseName = path.basename(originalName, ext) || 'image';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`;
  const pathname = `${subDir}/${fileName}`;

  // Upload to Vercel Blob
  const blob = await put(pathname, bytes, {
    access: 'public',
    contentType: file.type,
  });

  // Returns the public URL
  return blob.url;
}

export async function deleteUploadedImageIfLocal(imagePath?: string): Promise<void> {
  if (!imagePath || !imagePath.includes('vercel-storage.com')) return;

  try {
    // Delete from Vercel Blob using the full URL
    await del(imagePath);
  } catch (error) {
    console.error('Failed to delete blob:', error);
    // Ignore errors to keep operations resilient
  }
}
