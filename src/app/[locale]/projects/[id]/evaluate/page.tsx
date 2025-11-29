import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import { EvaluateClientProps } from '@/types/evaluate';
import { getTranslations } from 'next-intl/server';

// EvaluateClientを動的インポート
const EvaluateClient = dynamic<EvaluateClientProps>(() => import('@/components/EvaluateClient'), {
  loading: () => (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
    >
      <CircularProgress />
    </Box>
  ),
  ssr: true,
});

interface PageParams {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata(context: PageParams): Promise<Metadata> {
  const params = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: project ? `Evaluate: ${project.name}` : 'Project Not Found' };
}

export default async function EvaluatePage(context: PageParams) {
  const params = await context.params;
  const t = await getTranslations('projects');

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      questions: { select: { id: true, text: true, leftLabel: true, rightLabel: true } },
      images: { select: { id: true, url: true } },
    },
  });

  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>{t('notFound')}</h1>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <EvaluateClient project={{
        ...project,
        allowMultipleAnswers: (project as any).allowMultipleAnswers ?? true
      }} />
    </Suspense>
  );
}
