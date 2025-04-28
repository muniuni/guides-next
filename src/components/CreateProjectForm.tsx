"use client";
import React, { useState } from "react";
import { Button, TextField, Stack, CircularProgress } from "@mui/material";

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateProjectForm({
  onSuccess,
  onCancel,
}: CreateProjectFormProps) {
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
      alert("プロジェクト作成に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label="Project Name"
          value={name}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          fullWidth
        />
        <TextField
          label="Description"
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
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
