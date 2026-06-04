import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_REGION || 'eu-central-1', // usually eu-central-1 or similar for supabase, doesn't matter too much for standard s3 client with forcePathStyle
  endpoint: 'https://ytjnwekfelgtxobqmbso.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { filePath, contentType } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: 'Profile pics',
      Key: filePath,
      ContentType: contentType || 'image/jpeg',
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
