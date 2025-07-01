import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// S3 クライアント初期化
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.S3_BUCKET_NAME!;

interface RouteContext {
  params: Promise<{ imageId: string }>;
}

export async function DELETE(
  req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  // DB から画像レコード取得
  const img = await prisma.image.findUnique({ where: { id: resolvedParams.imageId } });
  if (!img) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // S3 上のキーを抽出
  // URL 例: https://<BUCKET>.s3.<REGION>.amazonaws.com/uploads/xxxxx.jpg
  const prefix = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
  const key = img.url.startsWith(prefix)
    ? img.url.slice(prefix.length)
    : img.url.replace(/^\//, "");

  // S3 からオブジェクト削除
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );

  // DB レコード削除
  await prisma.image.delete({ where: { id: params.imageId } });

  return NextResponse.json({ ok: true });
}
