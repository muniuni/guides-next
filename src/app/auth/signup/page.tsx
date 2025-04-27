"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { TextField, Button, Container, Typography, Stack } from "@mui/material";
import bcrypt from "bcryptjs";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hashed = await bcrypt.hash(password, 10);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: hashed }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "登録に失敗しました");
      return;
    }

    const result = await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/",
    });
  };

  return (
    <Container maxWidth="xs" sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>
        Create Account
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained">
            Create Account
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
