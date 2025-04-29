import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import React from 'react';
import { Box, Paper, Typography, Divider, Stack } from '@mui/material';
import ProjectConsent from '@/components/ProjectConsent';

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return {
    title: project ? project.name : 'Project',
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
        backgroundColor: '#f5f5f5',
        width: '100%',
        minHeight: ['calc(100vh - 56px)', 'calc(100vh - 64px)'],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 800, md: 1200 },
          p: { xs: 3, sm: 4, md: 6 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#000000',
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            textAlign: 'center',
          }}
        >
          {project.name}
        </Typography>
        <Divider sx={{ mb: { xs: 2, sm: 3, md: 4 }, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

        <Stack spacing={{ xs: 3, sm: 4, md: 6 }}>
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#000000',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              About this project
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                lineHeight: 1.6,
              }}
            >
              {project.description}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#000000',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              Consent information
            </Typography>
            <Box
              sx={{
                maxHeight: { xs: '40vh', sm: '50vh', md: '60vh' },
                overflowY: 'auto',
                p: { xs: 2, sm: 3 },
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: { xs: 2, sm: 3 },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#000000',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: 1.6,
                }}
              >
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
