'use client';
import React from 'react';
import { Box, Typography, Divider, Stack, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import MarkdownContent from '@/components/MarkdownContent';
import ProjectConsent from '@/components/ProjectConsent';
import { getDurationStatus, formatDateForDisplay } from '@/lib/duration-utils';

interface ProjectContentProps {
  project: {
    id: string;
    name: string;
    description: string;
    consentInfo: string;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const tDuration = useTranslations('duration');
  
  // Duration status logic
  const durationStatus = getDurationStatus(project.startDate, project.endDate);
  const startDisplay = formatDateForDisplay(project.startDate);
  const endDisplay = formatDateForDisplay(project.endDate);
  const hasDuration = project.startDate || project.endDate;
  
  const periodText = endDisplay 
    ? tDuration('period', { start: startDisplay, end: endDisplay })
    : startDisplay 
      ? `${startDisplay}〜${tDuration('noEndDate')}`
      : tDuration('noEndDate');

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 800, md: 1200 } }}>
      {/* 実施期間ステータス表示 */}
      {hasDuration && (
        <Box 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            p: 2,
            borderRadius: 2,
            border: 2,
            borderColor: durationStatus.isActive ? 'success.main' : 'error.main',
            backgroundColor: 'transparent',
            color: durationStatus.isActive ? 'success.main' : 'error.main'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {durationStatus.isActive ? tDuration('active') : tDuration('inactive')}：{periodText}
          </Typography>
        </Box>
      )}
      
      <Paper
        elevation={4}
        sx={{
          width: '100%',
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
          <ProjectConsent projectId={project.id} isActive={durationStatus.isActive} />
        </Box>
      </Stack>
      </Paper>
    </Box>
  );
}
