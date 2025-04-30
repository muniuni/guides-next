import EditProjectForm from '@/components/EditProjectForm';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

interface Params {
  id: string;
}

export default async function EditPage({ params }: { params: Params | Promise<Params> }) {
  const resolvedParams = await params;

  // Get current user session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(
      '/auth/login?callbackUrl=' + encodeURIComponent(`/projects/${resolvedParams.id}/edit`)
    );
  }

  const { id } = resolvedParams;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { questions: true, images: true },
  });

  if (!project) {
    return <div>Project not found.</div>;
  }

  // Check if current user is the owner of the project
  if (project.userId !== session.user.id) {
    return <div>Not authorized to edit this project.</div>;
  }

  return <EditProjectForm initialProject={project} />;
}
