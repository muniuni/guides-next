import React from "react";
import { Metadata } from "next";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

interface Params {
  params: { id: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return {
    title: "Thank You",
    description: "Your evaluation has been submitted.",
  };
}

export default function ThanksPage({ params }: Params) {
  const { id } = params;
  return (
    <Box maxWidth="600px" mx="auto" mt={8} px={2} textAlign="center">
      <Typography variant="h4" gutterBottom>
        Thank You!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your responses have been successfully submitted.
      </Typography>
      <Box mt={4}>
        <Button variant="contained" component={Link} href={`/projects/${id}`}>
          Back to Project
        </Button>
        <Button variant="outlined" component={Link} href="/" sx={{ ml: 2 }}>
          Home
        </Button>
      </Box>
    </Box>
  );
}
