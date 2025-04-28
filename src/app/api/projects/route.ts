import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      user: {
        select: { username: true, id: true },
      },
      images: true,
      questions: true,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, description } = await req.json();
  const project = await prisma.project.create({
    data: {
      name,
      description,
      consentInfo: "",
      imageCount: 6,
      imageDuration: 5,
      userId: session.user.id,
    },
  });
  return NextResponse.json(project);
}
