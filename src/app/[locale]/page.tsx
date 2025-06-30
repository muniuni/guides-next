import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Box, Typography, CircularProgress } from '@mui/material';
import ProjectsClient from './projects-client';
import { getProjectsSlim } from '@/lib/db/projects';

export const revalidate = 30;

export default async function HomePage() {
  const t = await getTranslations('projects');

  // try-catchでデータフェッチエラーを処理する
  try {
    const projects = await getProjectsSlim();

    return (
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" mb={2}>
          {t('title')}
        </Typography>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          }
        >
          <ProjectsClient initialProjects={projects} />
        </Suspense>
      </Box>
    );
  } catch (error) {
    // エラー処理
    console.error('Failed to fetch projects:', error);

    return (
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" mb={2}>
          Projects
        </Typography>
        <Typography color="error" align="center" my={4}>
          Failed to load projects. Please try again later.
        </Typography>
      </Box>
    );
  }
}
