import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { username, email, password } = await req.json();
  const userId = session.user.id;

  if (!username || !email) {
    return NextResponse.json(
      { message: "Username and email are required." },
      { status: 400 },
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      {
        message:
          "Username may only contain lowercase letters (a–z), numbers (0–9), hyphens (-) and underscores (_).",
      },
      { status: 400 },
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (email !== current.email) {
    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) {
      return NextResponse.json(
        { message: "Email is already in use." },
        { status: 400 },
      );
    }
  }
  if (username !== current.username) {
    const existsUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existsUsername) {
      return NextResponse.json(
        { message: "Username is already taken." },
        { status: 400 },
      );
    }
  }

  const updateData: any = { username, email };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json(
    { message: "Account updated successfully." },
    { status: 200 },
  );
}
