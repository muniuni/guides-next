import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import formidable, { IncomingForm, Files } from "formidable";
import { IncomingMessage } from "http";
import fs from "fs";
import path from "path";
import type { Image } from "@prisma/client";

export const config = { api: { bodyParser: false } };

interface Params {
  id: string;
}

export async function POST(
  req: Request,
  { params }: { params: Params },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = new IncomingForm({ multiples: true });
  const parsed = await new Promise<{ files: formidable.File[] }>(
    (resolve, reject) => {
      form.parse(
        req as unknown as IncomingMessage,
        (err: Error | null, _fields: formidable.Fields, files: Files) => {
          if (err) return reject(err);
          const rawFiles = files.file;
          if (!rawFiles) {
            return reject(new Error("No files provided"));
          }
          const fileArray = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
          resolve({ files: fileArray });
        },
      );
    },
  );

  const createdImages: Image[] = [];

  for (const file of parsed.files) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = fs.readFileSync(file.filepath);
    const filename = file.newFilename;
    const savePath = `/uploads/${filename}`;
    const dest = path.join(uploadDir, filename);
    fs.writeFileSync(dest, buffer);

    const imgRecord = await prisma.image.create({
      data: {
        url: savePath,
        project: { connect: { id: params.id } },
      },
    });

    createdImages.push(imgRecord);
  }

  return NextResponse.json(createdImages);
}
