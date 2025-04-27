import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const consentInfo = formData.get("consentInfo") as string;
  const questionsJson = formData.get("questions") as string;
  const existingIdsJson = formData.get("existingImageIds") as string;

  const questionList: Array<{ id?: string; text: string }> =
    JSON.parse(questionsJson);
  const existingImageIds: string[] = JSON.parse(existingIdsJson);

  const questionUpserts = questionList.map((q) =>
    q.id
      ? {
          where: { id: q.id },
          update: { text: q.text },
          create: { text: q.text },
        }
      : {
          where: { id: "" },
          update: { text: q.text },
          create: { text: q.text },
        },
  );

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description,
      consentInfo,
      questions: { upsert: questionUpserts },
    },
  });

  const currentImages = await prisma.image.findMany({ where: { projectId } });
  for (const img of currentImages) {
    if (!existingImageIds.includes(img.id)) {
      const filePath = path.join(
        process.cwd(),
        "public",
        img.url.replace(/^\//, ""),
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  const newFiles = formData.getAll("newImages") as File[];
  for (const file of newFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, buffer);
    await prisma.image.create({
      data: {
        url: `/uploads/${fileName}`,
        project: { connect: { id: projectId } },
      },
    });
  }

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questions: true, images: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
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
