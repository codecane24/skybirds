// Netlify Blobs upload solution
// Install: npm install @netlify/blobs

import { getStore } from '@netlify/blobs';
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
  const blobPath = `${subDir}/${fileName}`;

  // Get Netlify Blobs store
  const store = getStore('skybirds-uploads');
  
  // Upload to Netlify Blobs
  await store.set(blobPath, bytes, {
    metadata: {
      contentType: file.type,
      originalName: file.name,
    }
  });

  // Return the blob URL
  // The URL will be: https://[site-id].netlify.app/.netlify/blobs/[store-name]/[blobPath]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:4028';
  return `${siteUrl}/.netlify/blobs/skybirds-uploads/${blobPath}`;
}

export async function deleteUploadedImageIfLocal(imagePath?: string): Promise<void> {
  if (!imagePath || !imagePath.includes('/.netlify/blobs/')) return;

  try {
    // Extract blob path from URL
    const match = imagePath.match(/\.netlify\/blobs\/skybirds-uploads\/(.*)/);
    if (match && match[1]) {
      const store = getStore('skybirds-uploads');
      await store.delete(match[1]);
    }
  } catch (error) {
    console.error('Failed to delete blob:', error);
    // Ignore errors to keep operations resilient
  }
}
