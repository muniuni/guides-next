// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const config = { api: { bodyParser: false } };

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

export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;

  const formData = await request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const consentInfo = formData.get("consentInfo") as string;
  const questions = JSON.parse((formData.get("questions") as string) || "[]");
  const existingImageIds = JSON.parse(
    (formData.get("existingImageIds") as string) || "[]",
  );
  const imageCount = parseInt(formData.get("imageCount") as string, 10) || 0;
  const imageDuration =
    parseInt(formData.get("imageDuration") as string, 10) || 0;

  const files = formData.getAll("newImages") as File[];

  // 基本情報を更新
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description,
      consentInfo,
      imageCount,
      imageDuration,
    },
  });

  // Questionsのアップデート処理
  const keepQ: string[] = [];
  for (const q of questions) {
    if (q.id) {
      const updated = await prisma.question.update({
        where: { id: q.id },
        data: { text: q.text },
      });
      keepQ.push(updated.id);
    } else {
      const created = await prisma.question.create({
        data: { text: q.text, projectId },
      });
      keepQ.push(created.id);
    }
  }
  await prisma.question.deleteMany({
    where: { projectId, id: { notIn: keepQ.length ? keepQ : ["_"] } },
  });

  // 画像の処理 (S3アップロード)
  const current = await prisma.image.findMany({ where: { projectId } });
  for (const img of current) {
    if (!existingImageIds.includes(img.id)) {
      const key = img.url.split(`/${BUCKET}/`)[1] || img.url.replace(/^\//, "");
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${file.name}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: file.type,
      }),
    );
    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    await prisma.image.create({ data: { url, projectId } });
  }

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questions: true, images: true },
  });

  return NextResponse.json(updated);
}
