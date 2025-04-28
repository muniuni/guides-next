import EditProjectForm from "@/components/EditProjectForm";
import prisma from "@/lib/prisma";

interface Params {
  id: string;
}

export default async function EditPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { questions: true, images: true },
  });
  if (!project) {
    return <div>Project not found.</div>;
  }
  return <EditProjectForm initialProject={project} />;
}
