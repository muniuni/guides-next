'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { mutate } from 'swr';
import ProjectDetailsCard from './ProjectDetailsCard';

import { Project } from '@/types/project';

interface ProjectContextMenuProps {
  projects: Project[];
  anchorEl: null | HTMLElement;
  menuProjectId: string | null;
  userId: string | null;
  onClose: () => void;
  onDeleteSuccess?: (deletedId: string) => void;
}

export default function ProjectContextMenu({
  projects,
  anchorEl,
  menuProjectId,
  userId,
  onClose,
  onDeleteSuccess,
}: ProjectContextMenuProps) {
  const t = useTranslations('projects');
  const tCommon = useTranslations('common');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'info' | 'error',
  });

  const handleDeleteClick = () => {
    setPendingDeleteId(menuProjectId);
    setDeleteDialogOpen(true);
    onClose();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setLoading(true);
    const res = await fetch(`/api/projects/${pendingDeleteId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await mutate('/api/projects');
      setSnackbarState({
        open: true,
        message: 'Project deleted',
        severity: 'info',
      });

      if (onDeleteSuccess && pendingDeleteId) {
        onDeleteSuccess(pendingDeleteId);
      }
    }

    setDeleteDialogOpen(false);
    setLoading(false);
  };

  const handleDetailsClick = () => {
    const project = projects.find((p) => p.id === menuProjectId);
    if (project) {
      setSelectedProject({
        ...project,
        images: project.images || [],
        questions: project.questions || [],
      });
      setDetailsDialogOpen(true);
    }
    onClose();
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleDetailsClick}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('details')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: 'error.main' }}
          disabled={projects.find((p) => p.id === menuProjectId)?.userId !== userId}
        >
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>{t('delete')}</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('confirmDeletion')}</DialogTitle>
        <DialogContent>{t('confirmDeleteMessage')}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{tCommon('cancel')}</Button>
          <Button onClick={confirmDelete} color="error">
            {loading ? <CircularProgress size={24} /> : t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedProject && (
        <ProjectDetailsCard
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          project={selectedProject}
        />
      )}
    </>
  );
}
