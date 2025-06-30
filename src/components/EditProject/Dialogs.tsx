import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  content,
  confirmLabel,
  cancelLabel,
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onConfirm} color={confirmColor} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface DeleteImagesDialogProps {
  open: boolean;
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteImagesDialog({
  open,
  count,
  loading,
  onConfirm,
  onCancel,
}: DeleteImagesDialogProps) {
  const t = useTranslations('projects.edit');
  return (
    <ConfirmDialog
      open={open}
      title={t('deleteImages')}
      content={t('confirmDeleteImages', { count })}
      confirmLabel={t('deleteSelected')}
      cancelLabel={t('cancel')}
      confirmColor="error"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

interface DiscardChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardChangesDialog({ open, onConfirm, onCancel }: DiscardChangesDialogProps) {
  const t = useTranslations('projects.edit');
  return (
    <ConfirmDialog
      open={open}
      title={t('discardChanges')}
      content={t('confirmDiscard')}
      confirmLabel={t('discardChanges')}
      cancelLabel={t('keepEditing')}
      confirmColor="error"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
