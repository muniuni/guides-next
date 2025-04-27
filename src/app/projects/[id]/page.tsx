import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";
import { Box, Typography } from "@mui/material";
import ProjectConsent from "@/components/ProjectConsent";

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return {
    title: project ? project.name : "Project",
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      consentInfo: true,
    },
  });

  if (!project) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h5">Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="600px" mx="auto" mt={4} px={2}>
      <Typography variant="h4" gutterBottom>
        {project.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {project.description}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {project.consentInfo}
      </Typography>

      <ProjectConsent projectId={project.id} />
    </Box>
  );
}
