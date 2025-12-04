// src/lib/db/projects.ts
import prisma from '@/lib/prisma';
import { Project } from '@/types/project';

export async function getProjectsSlim(): Promise<Project[]> {
  // 必要なフィールドをすべて select で取得
  const rawProjects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    take: 20,
    orderBy: { updatedAt: 'desc' },
  });

  // Date → ISO 文字列に変換して返却
  return rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    userId: p.userId,
    user: {
      id: p.user.id,
      username: p.user.username,
      email: p.user.email,
    },
  }));
}

export async function getMyProjects(userId: string): Promise<Project[]> {
  const rawProjects = await prisma.project.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      images: {
        take: 1,
        select: {
          id: true,
          url: true,
        },
      },
      startDate: true,
      endDate: true,
      allowMultipleAnswers: true,
      evaluationMethod: true,
      consentInfo: true,
      imageCount: true,
      imageDuration: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    userId: p.userId,
    user: {
      id: p.user.id,
      username: p.user.username,
      email: p.user.email,
    },
    images: p.images,
    startDate: p.startDate ? p.startDate.toISOString() : undefined,
    endDate: p.endDate ? p.endDate.toISOString() : undefined,
    allowMultipleAnswers: p.allowMultipleAnswers,
    evaluationMethod: p.evaluationMethod,
    consentInfo: p.consentInfo,
    imageCount: p.imageCount,
    imageDuration: p.imageDuration,
  }));
}

export async function getFavoriteProjects(userId: string): Promise<Project[]> {
  const rawProjects = await prisma.project.findMany({
    where: {
      favoritedBy: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      images: {
        take: 1,
        select: {
          id: true,
          url: true,
        },
      },
      startDate: true,
      endDate: true,
      allowMultipleAnswers: true,
      evaluationMethod: true,
      consentInfo: true,
      imageCount: true,
      imageDuration: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    userId: p.userId,
    user: {
      id: p.user.id,
      username: p.user.username,
      email: p.user.email,
    },
    images: p.images,
    startDate: p.startDate ? p.startDate.toISOString() : undefined,
    endDate: p.endDate ? p.endDate.toISOString() : undefined,
    allowMultipleAnswers: p.allowMultipleAnswers,
    evaluationMethod: p.evaluationMethod,
    consentInfo: p.consentInfo,
    imageCount: p.imageCount,
    imageDuration: p.imageDuration,
  }));
}
