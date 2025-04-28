import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import formidable, { IncomingForm, Files } from "formidable";
import { IncomingMessage } from "http";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Image } from "@prisma/client";

export const config = { api: { bodyParser: false } };

// S3 クライアントの初期化
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

export async function POST(
  req: Request,
  { params }: { params: Params },
): Promise<NextResponse> {
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // フォームデータ解析
  const form = new IncomingForm({ multiples: true });
  const parsed = await new Promise<{ files: formidable.File[] }>(
    (resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (err, _fields, files) => {
        if (err) return reject(err);
        const raw = files.file;
        if (!raw) return reject(new Error("No files provided"));
        const arr = Array.isArray(raw) ? raw : [raw];
        resolve({ files: arr });
      });
    },
  );

  const createdImages: Image[] = [];
  // S3 アップロード
  for (const file of parsed.files) {
    const buffer = fs.readFileSync(file.filepath);
    const key = `uploads/${Date.now()}-${file.newFilename}`;
    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ACL: "public-read",
      ContentType: file.mimetype || undefined,
    });
    await s3.send(cmd);

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const img = await prisma.image.create({
      data: { url, project: { connect: { id: params.id } } },
    });
    createdImages.push(img);
  }

  return NextResponse.json(createdImages);
}
