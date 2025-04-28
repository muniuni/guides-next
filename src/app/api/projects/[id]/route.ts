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
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

// S3 client setup
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
  // Use Formidable to parse formdata including files
  const form = new formidable.IncomingForm({ multiples: true });
  const parsed = await new Promise<{
    fields: formidable.Fields;
    files: formidable.File[];
  }>((resolve, reject) => {
    form.parse(request as any, (err, fields, files) => {
      if (err) return reject(err);
      const raw = files.newImages;
      const filesArray = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
      resolve({ fields, files: filesArray });
    });
  });

  // Extract fields
  const {
    name,
    description,
    consentInfo,
    questions,
    existingImageIds,
    imageCount,
    imageDuration,
  } = parsed.fields;
  const questionList = questions ? JSON.parse(questions as string) : [];
  const existingIds: string[] = existingImageIds
    ? JSON.parse(existingImageIds as string)
    : [];
  const imgCount = parseInt(imageCount as string, 10) || 0;
  const imgDuration = parseInt(imageDuration as string, 10) || 0;

  // Update project basic info
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description,
      consentInfo,
      imageCount: imgCount,
      imageDuration: imgDuration,
    },
  });

  // Upsert questions
  const keepQ: string[] = [];
  for (const q of questionList) {
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

  // Remove images not in existingIds
  const current = await prisma.image.findMany({ where: { projectId } });
  for (const img of current) {
    if (!existingIds.includes(img.id)) {
      // Delete from S3
      const key = img.url.split(`/${BUCKET}/`)[1] || img.url.replace(/^\//, "");
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      // Delete from DB
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  // Upload new images to S3
  for (const file of parsed.files) {
    const buffer = file.filepath
      ? fs.readFileSync(file.filepath)
      : Buffer.from("");
    const key = `uploads/${Date.now()}-${file.newFilename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: file.mimetype,
      }),
    );
    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    await prisma.image.create({ data: { url, projectId } });
  }

  // Return updated project
  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questions: true, images: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete all images from S3 and DB
  const images = await prisma.image.findMany({ where: { projectId } });
  for (const img of images) {
    const key = img.url.split(`/${BUCKET}/`)[1] || img.url.replace(/^\//, "");
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  }
  await prisma.image.deleteMany({ where: { projectId } });

  // Delete questions and project
  await prisma.question.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ success: true });
}
