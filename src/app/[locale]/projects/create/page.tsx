"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Container, Typography, Stack } from "@mui/material";
import { useTranslations } from 'next-intl';
import { useModernAlert } from '@/components/ModernAlert';

export default function CreateProjectPage() {
  const router = useRouter();
  const tNotifications = useTranslations('notifications');
  const { showAlert, AlertComponent } = useModernAlert();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [consentInfo, setConsentInfo] = useState("");
  const [imageCount, setImageCount] = useState(6);
  const [imageDuration, setImageDuration] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        consentInfo,
        imageCount,
        imageDuration,
      }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      showAlert(tNotifications('creationFailed'), 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>
        New Project
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Project Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            value={description}
            multiline
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Create Project
          </Button>
        </Stack>
      </form>
      {AlertComponent}
    </Container>
  );
}
