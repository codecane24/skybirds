import { mkdir, writeFile, unlink, access } from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

// Check if local file system is writable (for local dev or VPS)
async function isFileSystemWritable(): Promise<boolean> {
  try {
    const testDir = path.join(PUBLIC_DIR, 'assets', 'upload');
    await mkdir(testDir, { recursive: true });
    const testFile = path.join(testDir, '.write-test');
    await writeFile(testFile, 'test');
    await unlink(testFile);
    return true;
  } catch {
    return false;
  }
}

// Local file system upload (development or VPS)
async function saveToLocalFileSystem(file: File, subDir: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = sanitizeFileName(file.name || 'image');
  const ext = path.extname(originalName) || '.png';
  const baseName = path.basename(originalName, ext) || 'image';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`;

  const relativeDir = path.join('assets', 'upload', subDir);
  const absoluteDir = path.join(PUBLIC_DIR, relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absoluteFilePath = path.join(absoluteDir, fileName);
  await writeFile(absoluteFilePath, buffer);

  return `/${path.join(relativeDir, fileName).replace(/\\/g, '/')}`;
}

// Vercel Blob upload (serverless production)
async function saveToVercelBlob(file: File, subDir: string): Promise<string> {
  try {
    const { put } = await import('@vercel/blob');
    
    const bytes = await file.arrayBuffer();
    const originalName = sanitizeFileName(file.name || 'image');
    const ext = path.extname(originalName) || '.png';
    const baseName = path.basename(originalName, ext) || 'image';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`;
    const pathname = `${subDir}/${fileName}`;

    const blob = await put(pathname, bytes, {
      access: 'public',
      contentType: file.type,
    });

    return blob.url;
  } catch (error) {
    console.error('Vercel Blob upload failed:', error);
    throw new Error('Cloud storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable or use a VPS with writable file system.');
  }
}

// Main upload function - automatically chooses the right method
export async function saveUploadedImage(file: File, subDir: string): Promise<string> {
  // Try local file system first (works in development and VPS)
  const canWriteLocally = await isFileSystemWritable();
  
  if (canWriteLocally) {
    console.log('Using local file system for upload');
    return saveToLocalFileSystem(file, subDir);
  }
  
  // Fall back to Vercel Blob for serverless environments
  console.log('Using Vercel Blob for upload (serverless environment)');
  return saveToVercelBlob(file, subDir);
}

// Delete uploaded image - handles both local and cloud storage
export async function deleteUploadedImageIfLocal(imagePath?: string): Promise<void> {
  if (!imagePath) return;

  // Handle Vercel Blob URLs
  if (imagePath.includes('vercel-storage.com')) {
    try {
      const { del } = await import('@vercel/blob');
      await del(imagePath);
      console.log('Deleted from Vercel Blob:', imagePath);
    } catch (error) {
      console.error('Failed to delete from Vercel Blob:', error);
      // Ignore errors to keep operations resilient
    }
    return;
  }

  // Handle local file system
  if (imagePath.startsWith('/assets/upload/')) {
    const absoluteFilePath = path.join(PUBLIC_DIR, imagePath.replace(/^\//, ''));
    try {
      await unlink(absoluteFilePath);
      console.log('Deleted from local file system:', imagePath);
    } catch {
      // Ignore missing files to keep operations resilient
    }
  }
}
