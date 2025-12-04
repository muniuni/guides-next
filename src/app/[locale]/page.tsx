import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Box, Typography, CircularProgress } from '@mui/material';
import ProjectsClient from './projects-client';
import { getMyProjects, getFavoriteProjects } from '@/lib/db/projects';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import ProjectPlaceholder from '@/components/ProjectPlaceholder';

export const revalidate = 0; // Disable static generation for user-specific data

export default async function HomePage() {
  const t = await getTranslations('projects');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
        <ProjectPlaceholder variant="guest" />
      </Box>
    );
  }

  // try-catchでデータフェッチエラーを処理する
  try {
    const [myProjects, favoriteProjects] = await Promise.all([
      getMyProjects(userId),
      getFavoriteProjects(userId),
    ]);

    return (
      <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
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
          <ProjectsClient
            initialMyProjects={myProjects}
            initialFavoriteProjects={favoriteProjects}
          />
        </Suspense>
      </Box>
    );
  } catch (error) {
    // エラー処理
    console.error('Failed to fetch projects:', error);

    return (
      <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
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
