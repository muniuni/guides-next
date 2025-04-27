// src/app/page.jsx
import Link from "next/link";
import { Button, Container, Typography, Stack } from "@mui/material";

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">My Evaluation Projects</Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/auth/signup" variant="outlined">
            Sign Up
          </Button>
          <Button component={Link} href="/auth/login" variant="contained">
            Log In
          </Button>
        </Stack>
      </Stack>

      {/* TODO: プロジェクト一覧をリスト表示 */}
    </Container>
  );
}
