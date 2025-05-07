import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

interface Params {
  id: string;
}

export async function POST(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // JSON形式で送信された画像のURLを取得
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Prismaを用いてDBに画像URLを登録
    const img = await prisma.image.create({
      data: {
        url,
        project: { connect: { id: params.id } },
      },
    });

    return NextResponse.json(img);
  } catch (error) {
    console.error('🚨 API Error details:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
