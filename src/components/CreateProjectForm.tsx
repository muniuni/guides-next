"use client";
import { useState } from "react";
import { Button, TextField, Stack } from "@mui/material";

export default function CreateProjectForm({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      onSuccess();
    } else {
      alert("プロジェクト作成に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label="Project Name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          multiline
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
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
          <Button type="submit" variant="contained">
            Create
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
