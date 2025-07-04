"use client";
import React, { useState } from "react";
import { Button, TextField, Stack, CircularProgress } from "@mui/material";
import { useTranslations } from 'next-intl';

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export default function CreateProjectForm({
  onSuccess,
  onCancel,
  onError,
}: CreateProjectFormProps) {
  const t = useTranslations('projects.create');
  const tNotifications = useTranslations('notifications');
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    setLoading(false);

    if (res.ok) {
      onSuccess();
    } else {
      onError(tNotifications('creationFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label={t('projectName')}
          value={name}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          fullWidth
        />
        <TextField
          label={t('description')}
          value={description}
          multiline
          rows={3}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
          fullWidth
        />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ pt: 1 }}
        >
          <Button variant="outlined" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('create')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
