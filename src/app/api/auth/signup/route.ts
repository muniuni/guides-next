import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { message: "メールアドレスは既に使われています" },
      { status: 400 },
    );
  }
  await prisma.user.create({
    data: { email, password },
  });
  return NextResponse.json({ message: "OK" });
}
