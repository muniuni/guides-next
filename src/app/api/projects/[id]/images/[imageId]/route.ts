import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteContext {
  params: {
    imageId: string;
  };
}

export async function DELETE(
  req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const img = await prisma.image.findUnique({ where: { id: params.imageId } });
  if (!img) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  fs.unlinkSync(`.${img.url}`);

  await prisma.image.delete({ where: { id: params.imageId } });

  return NextResponse.json({ ok: true });
}
