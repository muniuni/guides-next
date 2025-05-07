import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { sessionId, answers } = await request.json();

  if (typeof sessionId !== 'string' || !Array.isArray(answers)) {
    return NextResponse.json(
      {
        error: 'Invalid payload: sessionId must be string and answers must be array',
      },
      { status: 400 }
    );
  }

  try {
    await Promise.all(
      answers.map((a: { imageId: string; questionId: string; value: number }) =>
        prisma.score.create({
          data: {
            sessionId,
            imageId: a.imageId,
            questionId: a.questionId,
            value: a.value,
          },
        })
      )
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error saving scores:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
