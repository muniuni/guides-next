import EditProjectForm from '@/components/EditProject/EditProjectForm';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface PageParams {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditPage(context: PageParams) {
  const params = await context.params;
  const t = await getTranslations('projects');

  // Get current user session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(
      '/auth/login?callbackUrl=' + encodeURIComponent(`/${params.locale}/projects/${params.id}/edit`)
    );
  }

  const { id } = params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { questions: true, images: true },
  });

  if (!project) {
    return <div>{t('notFound')}</div>;
  }

  // Check if current user is the owner of the project
  if (project.userId !== session.user.id) {
    return <div>{t('edit.notAuthorized')}</div>;
  }

  return <EditProjectForm initialProject={project} />;
}
