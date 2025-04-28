// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const consentInfo = formData.get("consentInfo") as string;
  const imageCountRaw = formData.get("imageCount") as string;
  const imageDurationRaw = formData.get("imageDuration") as string;
  const questionsJson = formData.get("questions") as string;
  const existingImageIdsJson = formData.get("existingImageIds") as string;

  const imageCount = parseInt(imageCountRaw, 10) || 0;
  const imageDuration = parseInt(imageDurationRaw, 10) || 0;
  const questionList: Array<{ id?: string | null; text: string }> =
    questionsJson ? JSON.parse(questionsJson) : [];

  // プロジェクトの基本情報を更新
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

  // 質問の更新・作成
  const idsToKeep: string[] = [];
  for (const q of questionList) {
    if (q.id) {
      const updatedQ = await prisma.question.update({
        where: { id: q.id },
        data: { text: q.text },
      });
      idsToKeep.push(updatedQ.id);
    } else {
      const createdQ = await prisma.question.create({
        data: { text: q.text, projectId },
      });
      idsToKeep.push(createdQ.id);
    }
  }

  // リクエストに含まれない質問を削除
  await prisma.question.deleteMany({
    where: {
      projectId,
      id: {
        notIn: idsToKeep.length > 0 ? idsToKeep : [""],
      },
    },
  });

  // 既存画像の削除
  const existingImageIds: string[] = existingImageIdsJson
    ? JSON.parse(existingImageIdsJson)
    : [];
  const currentImages = await prisma.image.findMany({ where: { projectId } });
  for (const img of currentImages) {
    if (!existingImageIds.includes(img.id)) {
      const filePath = path.join(
        process.cwd(),
        "public",
        img.url.replace(/^\//, ""),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  // 新規画像の追加
  const newFiles = formData.getAll("newImages") as File[];
  for (const file of newFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, buffer);
    await prisma.image.create({
      data: { url: `/uploads/${fileName}`, projectId },
    });
  }

  // 更新後のプロジェクトを返却
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

  const images = await prisma.image.findMany({ where: { projectId } });
  for (const img of images) {
    const filePath = path.join(
      process.cwd(),
      "public",
      img.url.replace(/^\//, ""),
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.image.deleteMany({ where: { projectId } });
  await prisma.question.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ success: true });
}
