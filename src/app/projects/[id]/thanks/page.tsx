import React from 'react';
import { Metadata } from 'next';
import { Box, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return {
    title: 'Thank You',
    description: 'Your evaluation has been submitted.',
  };
}

export default function ThanksPage({ params }: Params) {
  const { id } = params;
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
        transform: 'translateY(-10vh)',
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
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#000000',
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Thank You!
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            color: '#000000',
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            lineHeight: 1.6,
            mb: { xs: 3, sm: 4, md: 6 },
          }}
        >
          Your responses have been successfully submitted.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            component={Link}
            href={`/projects/${id}`}
            sx={{
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
            }}
          >
            Back to Project
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href="/"
            sx={{
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
            }}
          >
            Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
