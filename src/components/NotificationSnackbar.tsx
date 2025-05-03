'use client';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

export default function NotificationSnackbar({
  open,
  message,
  severity,
  onClose,
}: NotificationSnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={8000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
