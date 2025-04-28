import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import formidable, { IncomingForm, Files } from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

interface Params {
  id: string;
}

export async function POST(req: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = new IncomingForm({ multiples: true });
  const parsed = await new Promise<{ files: formidable.File[] }>(
    (resolve, reject) =>
      form.parse(
        req as unknown as formidable.Request,
        (err: Error | null, fields: formidable.Fields, files: Files) => {
          if (err) {
            reject(err);
          } else {
            const fileArray = Array.isArray(files.file)
              ? files.file
              : [files.file];
            resolve({ files: fileArray as formidable.File[] });
          }
        },
      ),
  );

  const created = [];
  for (const file of parsed.files) {
    const data = fs.readFileSync(file.filepath);
    const savePath = `/public/uploads/${file.newFilename}`;
    fs.writeFileSync(`.${savePath}`, data);

    const img = await prisma.image.create({
      data: {
        url: savePath,
        project: { connect: { id: params.id } },
      },
    });
    created.push(img);
  }

  return NextResponse.json(created);
}
