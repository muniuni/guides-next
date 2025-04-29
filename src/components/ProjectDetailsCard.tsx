import { Dialog, DialogContent, Typography, Box, IconButton, Divider } from '@mui/material';
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
    imageCount?: number;
    questionCount?: number;
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

const daysAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${day} days ago`;
};

export default function ProjectDetailsCard({ open, onClose, project }: ProjectDetailsCardProps) {
  if (!project) return null;

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
          Project Details
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
            <Typography variant="body2">Created by {project.user.username}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">Created on {formatDate(project.createdAt)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">Last updated {daysAgo(project.updatedAt)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{project.imageCount || 0} images enrolled</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutlineOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{project.questionCount || 0} questions</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
