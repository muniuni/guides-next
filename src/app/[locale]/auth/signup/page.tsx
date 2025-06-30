"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/config";
import { signIn } from "next-auth/react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from 'next-intl';

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export default function SignUpPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (username: string) => {
    if (!username) return t('usernameRequired');
    if (!USERNAME_REGEX.test(username)) {
      return t('usernameFormat');
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "username") {
      const msg = validateUsername(value);
      setErrors((prev) => ({ ...prev, username: msg }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    const usernameErr = validateUsername(form.username);
    if (usernameErr) {
      setErrors({ username: usernameErr });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setGlobalError(data.message || t('unexpectedError'));
      return;
    }

    const loginResult = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (!loginResult || loginResult.error) {
      setGlobalError(t('autoLoginFailed'));
      return;
    }

    router.push("/?signup=true");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}
    >
      <Typography variant="h4" mb={2}>
        {t('signupTitle')}
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <TextField
        label={t('username')}
        name="username"
        value={form.username}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
        error={Boolean(errors.username)}
        helperText={errors.username}
        inputProps={{ pattern: USERNAME_REGEX.source }}
      />

      <TextField
        label={t('email')}
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />

      <TextField
        label={t('password')}
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={
          loading ||
          Boolean(errors.username) ||
          !form.username ||
          !form.email ||
          !form.password
        }
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : t('registerButton')}
      </Button>
    </Box>
  );
}
