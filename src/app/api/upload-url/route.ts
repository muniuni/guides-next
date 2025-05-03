import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.S3_BUCKET_NAME!;

export async function POST(req: Request) {
  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  // S3上の保存先キー
  const key = `uploads/${Date.now()}-${filename}`;

  // 署名付きPUTコマンドを作成
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read', // 公開したい場合
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });

  return NextResponse.json({
    uploadUrl,
    fileUrl: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  });
}
