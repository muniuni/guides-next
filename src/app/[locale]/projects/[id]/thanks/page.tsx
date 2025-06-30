import React from 'react';
import { Metadata } from 'next';
import { Box, Typography, Button, Paper } from '@mui/material';
import { getTranslations } from 'next-intl/server';

interface PageParams {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata(context: PageParams): Promise<Metadata> {
  const params = await context.params;
  const t = await getTranslations('evaluation.thanks');
  return {
    title: t('title'),
    description: t('message'),
  };
}

// Page layout styles
const layoutStyles = {
  container: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    minHeight: ['calc(100vh - 56px)', 'calc(100vh - 64px)'],
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    p: { xs: 2, sm: 3, md: 4 },
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    transform: 'translateY(-10vh)',
  },
  paper: {
    width: '100%',
    maxWidth: { xs: '100%', sm: 800, md: 1200 },
    p: { xs: 3, sm: 4, md: 6 },
    borderRadius: { xs: 2, sm: 3, md: 4 },
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
};

// Typography styles
const textStyles = {
  title: {
    fontWeight: 'bold',
    color: '#000000',
    mb: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
  },
  description: {
    color: '#000000',
    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
    lineHeight: 1.6,
    mb: { xs: 3, sm: 4, md: 6 },
  },
};

// Button styles
const buttonStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: { xs: 1, sm: 2 },
    flexWrap: 'wrap',
  },
  primary: {
    py: { xs: 1, sm: 1.5, md: 2 },
    px: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
    fontWeight: 'bold',
    borderRadius: { xs: 2, sm: 3 },
    background: '#000000',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      background: '#000000',
    },
  },
  secondary: {
    py: { xs: 1, sm: 1.5, md: 2 },
    px: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
    fontWeight: 'bold',
    borderRadius: { xs: 2, sm: 3 },
    borderColor: '#000000',
    color: '#000000',
    '&:hover': {
      borderColor: '#000000',
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
};

/**
 * ThanksPage component displays a thank you message after form submission
 */
export default async function ThanksPage(context: PageParams) {
  const params = await context.params;
  const t = await getTranslations('evaluation.thanks');
  const { id } = params;

  return (
    <Box sx={layoutStyles.container}>
      <Paper elevation={4} sx={layoutStyles.paper}>
        <Typography variant="h4" gutterBottom sx={textStyles.title}>
          {t('title')}
        </Typography>

        <Typography variant="body1" gutterBottom sx={textStyles.description}>
          {t('message')}
        </Typography>

        <Box sx={buttonStyles.container}>
          <Button
            variant="contained"
            href={`/projects/${id}`}
            sx={buttonStyles.primary}
          >
            {t('backToProject')}
          </Button>

          <Button variant="outlined" href="/" sx={buttonStyles.secondary}>
            {t('home')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
