// AWS S3 upload solution
// Install: npm install @aws-sdk/client-s3

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'skybirds-uploads';

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
  const ext = path.extname(originalName) || '.png';
  const baseName = path.basename(originalName, ext) || 'image';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`;
  const key = `${subDir}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read', // Make the file publicly accessible
  });

  await s3Client.send(command);

  // Return the public URL
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

export async function deleteUploadedImageIfLocal(imagePath?: string): Promise<void> {
  if (!imagePath || !imagePath.includes('.s3.')) return;

  try {
    // Extract key from S3 URL
    // Example: https://bucket.s3.region.amazonaws.com/team/filename.jpg
    const match = imagePath.match(/\.amazonaws\.com\/(.*)/);
    if (match && match[1]) {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: match[1],
      });
      await s3Client.send(command);
    }
  } catch (error) {
    console.error('Failed to delete from S3:', error);
    // Ignore errors to keep operations resilient
  }
}
