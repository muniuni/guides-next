'use client';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, Typography, Box, IconButton, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface ProjectDetailsCardProps {
  open: boolean;
  onClose: () => void;
  project: {
    name: string;
    description: string;
    user: {
      username: string;
    };
    createdAt: string;
    updatedAt: string;
    images: {
      id: string;
      url: string;
    }[];
    questions: {
      id: string | null;
      text: string;
    }[];
  };
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};

export default function ProjectDetailsCard({ open, onClose, project }: ProjectDetailsCardProps) {
  const t = useTranslations('projects');
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  
  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);
  
  if (!project) return null;

  const imageCount = project.images?.length || 0;
  const questionCount = project.questions?.length || 0;

  const daysAgo = (dateStr: string) => {
    if (currentTime === null) {
      return `0 ${t('daysAgo')}`; // フォールバック値
    }
    const diff = currentTime - new Date(dateStr).getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${day} ${t('daysAgo')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('projectDetails')}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {project.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PermIdentityOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('createdBy')} {project.user.username}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('createdOn')} {formatDate(project.createdAt)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('lastUpdated')} {daysAgo(project.updatedAt)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{imageCount} {t('imagesEnrolled')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutlineOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{questionCount} {t('questionsCount')}</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
