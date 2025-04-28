import prisma from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";
import { Box, Paper, Typography, Divider, Stack } from "@mui/material";
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
    select: { id: true, name: true, description: true, consentInfo: true },
  });

  if (!project) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h5" color="error">
          Project not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "grey.100",
        width: "100%",
        minHeight: ["calc(100vh - 56px)", "calc(100vh - 64px)"],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 800, p: 4, borderRadius: 2 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {project.name}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              About this project
            </Typography>
            <Typography variant="body1" color="text.primary">
              {project.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Consent information
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflowY: "auto",
                p: 2,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {project.consentInfo}
              </Typography>
            </Box>
          </Box>

          <Box>
            <ProjectConsent projectId={project.id} />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
