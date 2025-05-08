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
