"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  AlertColor,
  Stack,
} from "@mui/material";

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loadingSession = status === "loading";

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (session?.user) {
      setForm({
        username: (session.user as any).username || "",
        email: session.user.email || "",
        password: "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setGlobalError(data.message || "Update failed");
      return;
    }

    setSnackbar({
      open: true,
      message: "Account updated successfully",
      severity: "success",
    });

    router.push("/?accountUpdated=true");
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));

  if (loadingSession) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3 }}
    >
      <Typography variant="h4" mb={2}>
        Account Settings
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <TextField
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />

      <TextField
        label="New Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        helperText="Leave blank to keep current password"
        fullWidth
        margin="normal"
      />

      <Stack direction="row" spacing={2} sx={{ mt: 1, width: "100%" }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{ flex: "2 1 10%" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ flex: "8 1 10%" }}
        >
          {submitting ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
