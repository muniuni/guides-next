import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getMyProjects, getFavoriteProjects } from '@/lib/db/projects';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [myProjects, favoriteProjects] = await Promise.all([
    getMyProjects(userId),
    getFavoriteProjects(userId),
  ]);

  return NextResponse.json({ myProjects, favoriteProjects });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, description } = await req.json();
  const project = await prisma.project.create({
    data: {
      name,
      description,
      consentInfo: '',
      imageCount: 6,
      imageDuration: 5,
      userId: session.user.id,
    },
  });
  return NextResponse.json(project);
}
