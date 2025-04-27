"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (!USERNAME_REGEX.test(username)) {
      return "Lowercase letters, numbers, hyphens and underscores only";
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
      setGlobalError(data.message || "An unexpected error occurred.");
      return;
    }

    const loginResult = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (!loginResult || loginResult.error) {
      setGlobalError("Auto-login failed. Please log in manually.");
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
        Sign Up
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
        error={Boolean(errors.username)}
        helperText={errors.username}
        inputProps={{ pattern: USERNAME_REGEX.source }}
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
        label="Password"
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
        {loading ? <CircularProgress size={24} /> : "Sign Up"}
      </Button>
    </Box>
  );
}
