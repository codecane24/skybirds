import { mkdir, writeFile, unlink } from 'fs/promises';
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
  } catch (error) {
    console.log('File system not writable:', error instanceof Error ? error.message : String(error));
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
  // Check if Vercel Blob token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN not found. For Vercel deployment:\n' +
      '1. Go to Vercel Dashboard → Storage → Create Blob Store\n' +
      '2. Token will be auto-added to environment variables\n' +
      '3. Redeploy your app'
    );
  }

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Cloud storage upload failed: ${errorMessage}`);
  }
}

// Main upload function - automatically chooses the right method
export async function saveUploadedImage(file: File, subDir: string): Promise<string> {
  try {
    // Try local file system first (works in development and VPS)
    console.log('Attempting local file system upload...');
    return await saveToLocalFileSystem(file, subDir);
  } catch (localError) {
    // If local fails, fall back to Vercel Blob for serverless environments
    console.log('Local file system failed, trying Vercel Blob...');
    console.log('Local error:', localError instanceof Error ? localError.message : String(localError));
    
    try {
      return await saveToVercelBlob(file, subDir);
    } catch (cloudError) {
      console.error('Both upload methods failed');
      console.error('Local error:', localError);
      console.error('Cloud error:', cloudError);
      throw new Error(
        'Image upload failed. ' +
        (cloudError instanceof Error ? cloudError.message : 'Please contact support.')
      );
    }
  }
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
