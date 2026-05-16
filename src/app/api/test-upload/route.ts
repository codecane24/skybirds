import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check environment
    const diagnostics = {
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN 
        ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 15) + '...'
        : 'not configured',
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Try to check if we can import @vercel/blob
    let canImportBlob = false;
    let blobError = null;
    try {
      await import('@vercel/blob');
      canImportBlob = true;
    } catch (error) {
      blobError = error instanceof Error ? error.message : String(error);
    }

    // Check if file system is writable
    let fileSystemWritable = false;
    let fsError = null;
    try {
      const { mkdir, writeFile, unlink } = await import('fs/promises');
      const path = await import('path');
      const testDir = path.join(process.cwd(), 'public', 'assets', 'upload');
      await mkdir(testDir, { recursive: true });
      const testFile = path.join(testDir, '.write-test');
      await writeFile(testFile, 'test');
      await unlink(testFile);
      fileSystemWritable = true;
    } catch (error) {
      fsError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      status: 'ok',
      diagnostics,
      uploadCapabilities: {
        fileSystem: fileSystemWritable,
        fileSystemError: fsError,
        vercelBlob: canImportBlob && diagnostics.hasBlobToken,
        vercelBlobPackage: canImportBlob,
        blobError,
      },
      recommendation: 
        fileSystemWritable 
          ? 'Local file system is writable - uploads will use local storage'
          : canImportBlob && diagnostics.hasBlobToken
          ? 'Vercel Blob is configured - uploads will use cloud storage'
          : 'SETUP REQUIRED: Configure Vercel Blob Storage in Vercel Dashboard → Storage → Create Blob',
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ 
      error: 'Diagnostic failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
