import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

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
  return (
    <ConfirmDialog
      open={open}
      title="Confirm Deletion"
      content={`Are you sure you want to delete ${count} selected image${count !== 1 ? 's' : ''}?`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
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
  return (
    <ConfirmDialog
      open={open}
      title="Discard Changes?"
      content="You have unsaved changes. Are you sure you want to discard them?"
      confirmLabel="Discard Changes"
      cancelLabel="Keep Editing"
      confirmColor="error"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
