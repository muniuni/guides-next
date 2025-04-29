'use client';

import React, { useState } from 'react';
import { Box, FormControlLabel, Checkbox, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

interface ProjectConsentProps {
  projectId: string;
}

export default function ProjectConsent({ projectId }: ProjectConsentProps) {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreed(e.target.checked);
  };

  const handleStart = () => {
    router.push(`/projects/${projectId}/evaluate`);
  };

  return (
    <Box mt={4}>
      <FormControlLabel
        control={<Checkbox checked={agreed} onChange={handleCheckbox} />}
        label="I agree to participate in this evaluation"
      />
      <Box mt={2}>
        <Button variant="contained" disabled={!agreed} onClick={handleStart}>
          Start Evaluation
        </Button>
      </Box>
    </Box>
  );
}
