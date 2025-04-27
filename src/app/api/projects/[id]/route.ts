// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

// Ensure the uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  const formData = await req.formData();

  // Parse fields
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const consentInfo = formData.get("consentInfo") as string;
  const questionsJson = formData.get("questions") as string;
  const existingIdsJson = formData.get("existingImageIds") as string;

  const questionList: Array<{ id?: string; text: string }> =
    JSON.parse(questionsJson);
  const existingImageIds: string[] = JSON.parse(existingIdsJson);

  // Prepare upsert operations for questions
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

  // Update project basic info and questions
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description,
      consentInfo,
      questions: { upsert: questionUpserts },
    },
  });

  // Handle image deletions
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

  // Handle new image uploads
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

  // Return updated project with related data
  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questions: true, images: true },
  });

  return NextResponse.json(updated);
}
