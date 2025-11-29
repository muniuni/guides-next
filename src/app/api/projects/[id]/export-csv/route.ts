import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string; // project id in the URL
}

/**
 * GET /api/projects/[id]/export-csv
 *
 * Returns Score data as CSV for the specified project
 */
export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // Get all images for this project to filter scores
    const images = await prisma.image.findMany({
      where: { projectId: id },
      select: { id: true },
    });

    const imageIds = images.map((img) => img.id);

    // Get all scores for these images
    const scores = await prisma.score.findMany({
      where: {
        imageId: { in: imageIds },
      },
      include: {
        question: {
          select: {
            text: true,
          },
        },
        image: {
          select: {
            url: true,
          },
        },
      },
    });

    // Convert to CSV
    const headers = [
      'id',
      'value',
      'questionId',
      'imageId',
      'sessionId',
      'createdAt',
      'questionText',
      'imageUrl',
      'evaluationMethod',
    ];

    const csvRows = [
      headers.join(','),
      ...scores.map((score) =>
        [
          score.id,
          score.value,
          score.questionId,
          score.imageId,
          score.sessionId,
          score.createdAt.toISOString(),
          `"${score.question?.text?.replace(/"/g, '""') || ''}"`, // Handle quotes in text
          `"${score.image?.url?.replace(/"/g, '""') || ''}"`,
          score.evaluationMethod || 'slider',
        ].join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scores-project-${id}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
