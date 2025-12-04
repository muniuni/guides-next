'use client';

import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/config';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';

interface ProjectPlaceholderProps {
  variant: 'guest' | 'empty' | 'no-results' | 'no-favorites';
  onCreateClick?: () => void;
  onClearSearch?: () => void;
}

export default function ProjectPlaceholder({
  variant,
  onCreateClick,
  onClearSearch
}: ProjectPlaceholderProps) {
  const t = useTranslations('projectPlaceholder');

  const getContent = () => {
    switch (variant) {
      case 'guest':
        return {
          icon: <AccountCircleOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />,
          title: t('guest.title'),
          description: t('guest.description'),
          action: (
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                component={Link}
                href="/auth/login"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                {t('guest.login')}
              </Button>
              <Button
                component={Link}
                href="/auth/signup"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': { bgcolor: 'grey.900' }
                }}
              >
                {t('guest.register')}
              </Button>
            </Stack>
          )
        };
      case 'empty':
        return {
          icon: <FolderOpenOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />,
          title: t('empty.title'),
          description: t('empty.description'),
          action: (
            <Button
              variant="contained"
              onClick={onCreateClick}
              sx={{
                mt: 3,
                borderRadius: 2,
                bgcolor: 'black',
                color: 'white',
                '&:hover': { bgcolor: 'grey.900' }
              }}
            >
              {t('empty.create')}
            </Button>
          )
        };
      case 'no-results':
        return {
          icon: <SearchOffOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />,
          title: t('noResults.title'),
          description: t('noResults.description'),
          action: onClearSearch ? (
            <Button
              variant="outlined"
              onClick={onClearSearch}
              sx={{ mt: 3, borderRadius: 2 }}
            >
              {t('noResults.clearSearch')}
            </Button>
          ) : null
        };
      case 'no-favorites':
        return {
          icon: <StarBorderOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />,
          title: t('noFavorites.title'),
          description: t('noFavorites.description'),
          action: null
        };
    }
  };

  const content = getContent();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'grey.50',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'grey.300',
        minHeight: 400
      }}
    >
      {content.icon}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {content.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={500}>
        {content.description}
      </Typography>
      {content.action}
    </Paper>
  );
}
