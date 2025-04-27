import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";
import EvaluateClient from "@/components/EvaluateClient";

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: project ? `Evaluate: ${project.name}` : "Project Not Found" };
}

export default async function EvaluatePage({ params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      questions: { select: { id: true, text: true } },
      images: { select: { id: true, url: true } },
    },
  });

  if (!project) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h1>Project not found</h1>
        <p>指定されたプロジェクトIDが存在しません。</p>
      </div>
    );
  }

  return <EvaluateClient project={project} />;
}
