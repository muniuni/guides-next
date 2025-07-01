'use client';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreateProjectForm from './CreateProjectForm';
import { useTranslations } from 'next-intl';
import { useModernAlert } from './ModernAlert';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectDialog({
  open,
  onClose,
  onSuccess,
}: CreateProjectDialogProps) {
  const t = useTranslations('projects.create');
  const { showAlert, AlertComponent } = useModernAlert();

  const handleError = (message: string) => {
    showAlert(message, 'error');
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2 }}>
        {t('title')}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <CreateProjectForm onSuccess={onSuccess} onCancel={onClose} onError={handleError} />
      </DialogContent>
      {AlertComponent}
    </Dialog>
  );
}
