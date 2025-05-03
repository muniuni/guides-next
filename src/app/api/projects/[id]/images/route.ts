import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Image } from '@prisma/client';

export const config = { api: { bodyParser: false } };

// S3 クライアントの初期化
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

interface Params {
  id: string;
}

export async function POST(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll('file') as File[];

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const createdImages: Image[] = [];

  // ファイルをS3へアップロード
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: file.type,
    });

    await s3.send(command);

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const img = await prisma.image.create({
      data: { url, project: { connect: { id: params.id } } },
    });

    createdImages.push(img);
  }

  return NextResponse.json(createdImages);
}
