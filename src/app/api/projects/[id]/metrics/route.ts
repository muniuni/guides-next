import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string; // project id in the URL
}

/**
 * GET /api/projects/[id]/metrics
 *
 * Returns four blocks of data:
 *  - perImage     … [{ imageId, url, count }]
 *  - monthly      … [{ month: "YYYY-MM", count }]
 *  - avgByQuestion… [{ questionId, question, avg }]
 *  - questionScoresPerImage … [{ imageId, questionId, avg }]
 */
export async function GET(_req: Request, { params }: { params: Params }) {
  const id = params.id;
  console.log('id', id);

  /* 1. image-by-image score counts ---------------------------------------- */
  const perImage = await prisma.image.findMany({
    where: { projectId: id },
    select: {
      id: true,
      url: true,
      _count: { select: { scores: true } },
    },
  });

  /* 2. monthly total score counts ----------------------------------------- */
  // `groupBy` cannot bucket by month, so we use raw SQL (PostgreSQL syntax)
  const monthly = await prisma.$queryRaw<{ month: string; count: number }[]>`SELECT
     TO_CHAR(DATE_TRUNC('month', s."createdAt"), 'YYYY-MM') AS month,
     COUNT(*)::int                                         AS count  -- ★ここで int へキャスト
  FROM   "Score"  s
  JOIN   "Image"  i ON i.id = s."imageId"
  WHERE  i."projectId" = ${id}
  GROUP  BY 1
  ORDER  BY 1;`;

  /* 3. question-by-question average value --------------------------------- */
  const rawAvg = await prisma.score.groupBy({
    by: ['questionId'],
    where: { question: { projectId: id } },
    _avg: { value: true },
  });

  // attach the question text for readability
  const questionText = await prisma.question.findMany({
    where: { projectId: id },
    select: { id: true, text: true },
  });
  const textMap = Object.fromEntries(questionText.map((q) => [q.id, q.text]));

  const avgByQuestion = rawAvg.map((row) => ({
    questionId: row.questionId,
    question: textMap[row.questionId] ?? '(unknown)',
    avg: row._avg.value ?? 0,
  }));

  // Get IDs for filtering
  const imageIds = perImage.map((img) => img.id);
  const questionIds = questionText.map((q) => q.id);

  /* 4. question scores per image ------------------------------------------ */
  // Get average score for each question for each image (only within this project)
  const questionScoresPerImageRaw = await prisma.score.groupBy({
    by: ['imageId', 'questionId'],
    where: {
      imageId: { in: imageIds as any },
      questionId: { in: questionIds as any },
    },
    _avg: { value: true },
  });

  // Transform
  const formattedQuestionScores = questionScoresPerImageRaw.map((row) => ({
    imageId: row.imageId,
    questionId: row.questionId,
    avg: row._avg.value ?? 0,
  }));

  /* 5. Unique respondents ------------------------------------------------- */
  const uniqueRespondents = await prisma.score.count({
    where: { imageId: { in: imageIds as any } },
    distinct: ['sessionId'],
  });

  return NextResponse.json({
    perImage,
    monthly,
    avgByQuestion,
    questionScoresPerImage: formattedQuestionScores,
    uniqueRespondents,
  });
}
