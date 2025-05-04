import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}

/**
 * GET /api/projects/[id]/evaluate-data
 *
 * Returns project data needed for evaluation, including all images
 */
export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const projectId = params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        questions: { select: { id: true, text: true } },
        images: { select: { id: true, url: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project data:', error);
    return NextResponse.json({ error: 'Failed to load project data' }, { status: 500 });
  }
}
