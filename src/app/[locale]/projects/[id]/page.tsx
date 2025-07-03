import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Box } from '@mui/material';
import ProjectContent from '@/components/ProjectContent';

interface PageParams {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata(context: PageParams): Promise<Metadata> {
  const params = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true, description: true },
  });
  
  const title = project ? project.name : 'Project';
  const description = project?.description || 'n-GUIDESは、あなたの感性評価プロジェクトを支援する統合型プラットフォームです。';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/ogp/thumbnail.png',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ProjectPage(context: PageParams) {
  const params = await context.params;
  const t = await getTranslations('projects');
  
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, description: true, consentInfo: true, startDate: true, endDate: true },
  });

  if (!project) {
    return (
      <Box textAlign="center" mt={8}>
        <Box color="error.main" fontSize="h5.fontSize">
          {t('notFound')}
        </Box>
      </Box>
    );
  }

  const projectWithStringDates = {
    ...project,
    startDate: project.startDate?.toISOString() || null,
    endDate: project.endDate?.toISOString() || null,
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        width: '100%',
        minHeight: ['calc(100vh - 56px)', 'calc(100vh - 64px)'],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 1, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        pt: { xs: '20px', sm: '56px', md: '56px' },
        overflow: 'auto',
      }}
    >
      <ProjectContent project={projectWithStringDates} />
    </Box>
  );
}
