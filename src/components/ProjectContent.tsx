'use client';
import React from 'react';
import { Box, Typography, Divider, Stack, Paper } from '@mui/material';
import MarkdownContent from '@/components/MarkdownContent';
import ProjectConsent from '@/components/ProjectConsent';

interface ProjectContentProps {
  project: {
    id: string;
    name: string;
    description: string;
    consentInfo: string;
  };
}

export default function ProjectContent({ project }: ProjectContentProps) {
  return (
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
        mt: { xs: 0, sm: 0, md: 0 },
        mb: { xs: 4, sm: 6, md: 8 },
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
          <Box
            sx={{
              color: '#000000',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              lineHeight: 1.6,
            }}
          >
            <MarkdownContent content={project.description} />
          </Box>
        </Box>

        <Box>
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
            <Box
              sx={{
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.6,
              }}
            >
              <MarkdownContent content={project.consentInfo} />
            </Box>
          </Box>
        </Box>

        <Box>
          <ProjectConsent projectId={project.id} />
        </Box>
      </Stack>
    </Paper>
  );
}
