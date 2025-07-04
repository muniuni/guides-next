// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const config = { api: { bodyParser: false } };

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

/* ───────────────────────────── PUT ───────────────────────────── */

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Next.js 15 では params を await する必要がある
  const params = await context.params;
  const projectId = String(params.id);

  // Check if the current user owns this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to edit this project' },
      { status: 403 }
    );
  }

  const formData = await request.formData();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const consentInfo = formData.get('consentInfo') as string;
  const questions = JSON.parse((formData.get('questions') as string) || '[]');
  const existingImageIds = JSON.parse((formData.get('existingImageIds') as string) || '[]');
  const imagesToDelete = JSON.parse((formData.get('imagesToDelete') as string) || '[]');
  const imageCount = parseInt(formData.get('imageCount') as string, 10) || 0;
  const imageDuration = parseInt(formData.get('imageDuration') as string, 10) || 0;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const startDate = startDateStr && startDateStr !== '' ? new Date(startDateStr) : null;
  const endDate = endDateStr && endDateStr !== '' ? new Date(endDateStr) : null;

  /* 1. プロジェクト基本情報更新 */
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description,
      consentInfo,
      imageCount,
      imageDuration,
      startDate,
      endDate,
    },
  });

  /* 2. 質問の同期 */
  const keepQuestionIds: string[] = [];
  for (const q of questions) {
    if (q.id) {
      const updated = await prisma.question.update({
        where: { id: q.id },
        data: { text: q.text },
      });
      keepQuestionIds.push(updated.id);
    } else {
      const created = await prisma.question.create({
        data: { text: q.text, projectId },
      });
      keepQuestionIds.push(created.id);
    }
  }
  await prisma.question.deleteMany({
    where: {
      projectId,
      id: { notIn: keepQuestionIds.length ? keepQuestionIds : ['_'] },
    },
  });

  /* 3. 既存画像の削除 */
  const currentImages = await prisma.image.findMany({ where: { projectId } });
  for (const img of currentImages) {
    if (!existingImageIds.includes(img.id) || imagesToDelete.includes(img.id)) {
      // 先に関連するScoreレコードを削除（FK制約回避）
      await prisma.score.deleteMany({
        where: { imageId: img.id },
      });

      const key = img.url.split('.amazonaws.com/')[1];
      if (key) {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      }
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  /* 4. 新規画像の登録 */
  // 新規画像は既にS3にアップロードされているので、URLのみをDBに登録
  const existingImagesForUrl = await prisma.image.findMany({
    where: { projectId },
    select: { id: true, url: true },
  });

  const newImageUrls = existingImageIds
    .filter((id: string) => id.startsWith('temp-'))
    .map((id: string) => {
      // 対応する画像URLを取得
      const image = existingImagesForUrl.find((img) => img.id === id);
      return image?.url;
    })
    .filter((url): url is string => url !== null && url !== undefined && url !== '');

  for (const url of newImageUrls) {
    await prisma.image.create({ data: { url, projectId } });
  }

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questions: true, images: true },
  });

  return NextResponse.json(updated);
}

/* ─────────────────────────── DELETE ─────────────────────────── */

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Next.js 15 では params を await する必要がある
  const params = await context.params;
  const projectId = String(params.id);

  try {
    // Check if the current user owns this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this project' },
        { status: 403 }
      );
    }

    /* 1. Score を先に削除（FK 制約回避） */
    await prisma.score.deleteMany({
      where: {
        OR: [{ image: { projectId } }, { question: { projectId } }],
      },
    });

    /* 2. S3 上の画像を削除 */
    const images = await prisma.image.findMany({ where: { projectId } });
    for (const img of images) {
      const key = img.url.split('.amazonaws.com/')[1];
      if (key) {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      }
    }

    /* 3. Image / Question / Project を削除 */
    await prisma.image.deleteMany({ where: { projectId } });
    await prisma.question.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}
