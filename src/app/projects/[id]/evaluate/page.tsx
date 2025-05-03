import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import { EvaluateClientProps } from '@/types/evaluate';

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

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: project ? `Evaluate: ${project.name}` : 'Project Not Found' };
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
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>Project not found</h1>
        <p>指定されたプロジェクトIDが存在しません。</p>
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
      <EvaluateClient project={project} />
    </Suspense>
  );
}
