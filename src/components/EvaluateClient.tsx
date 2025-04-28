"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
}
interface ImageItem {
  id: string;
  url: string;
}
interface ProjectProps {
  id: string;
  imageCount: number;
  imageDuration: number;
  questions: Question[];
  images: ImageItem[];
}
interface EvaluateClientProps {
  project: ProjectProps;
}
interface Answer {
  imageId: string;
  questionId: string;
  value: number;
}

export default function EvaluateClient({ project }: EvaluateClientProps) {
  const router = useRouter();
  const sessionId = useMemo(() => uuidv4(), []);

  const imagesToShow = useMemo(
    () => project.images.slice(0, project.imageCount),
    [project.images, project.imageCount],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"showImage" | "showSliders">("showImage");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (phase === "showImage") {
      const t0 = Date.now();
      setStartTime(t0);
      setNow(t0);
    }
  }, [phase]);
  useEffect(() => {
    if (phase === "showImage" && startTime !== null) {
      let rafId: number;
      const tick = () => {
        setNow(Date.now());
        rafId = requestAnimationFrame(tick);
      };
      tick();
      return () => cancelAnimationFrame(rafId);
    }
  }, [phase, startTime]);

  const elapsed = startTime !== null ? (now - startTime) / 1000 : 0;
  const timeLeft = Math.max(project.imageDuration - elapsed, 0);
  useEffect(() => {
    if (phase === "showImage" && timeLeft <= 0) setPhase("showSliders");
  }, [phase, timeLeft]);

  if (!imagesToShow.length)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        No images registered.
      </Alert>
    );

  const handleAnswerSubmit = (
    vals: { questionId: string; value: number }[],
  ) => {
    const batch = vals.map((v) => ({
      imageId: imagesToShow[currentIndex].id,
      questionId: v.questionId,
      value: v.value,
    }));
    setAnswers((prev) => [...prev, ...batch]);
    if (currentIndex + 1 < imagesToShow.length) {
      setCurrentIndex((i) => i + 1);
      const nowTs = Date.now();
      setStartTime(nowTs);
      setNow(nowTs);
      setPhase("showImage");
    } else {
      submitAllScores([...answers, ...batch]);
    }
  };

  const submitAllScores = async (all: Answer[]) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: all }),
      });
      if (!res.ok) throw new Error();
      router.push(`/projects/${project.id}/thanks`);
    } catch (e) {
      setError("Error submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "grey.100",
        width: "100%",
        minHeight: ["calc(100vh - 56px)", "calc(100vh - 64px)"],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 600, p: 4, borderRadius: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Evaluation ({currentIndex + 1}/{imagesToShow.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {phase === "showImage" ? (
          <Stack alignItems="center" spacing={2}>
            <Box
              component="img"
              src={imagesToShow[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              sx={{ maxWidth: "100%", maxHeight: "50vh", borderRadius: 1 }}
            />
            <LinearProgress
              variant="determinate"
              value={(timeLeft / project.imageDuration) * 100}
              sx={{ width: "100%", height: 8, borderRadius: 4 }}
            />
          </Stack>
        ) : (
          <SliderForm
            questions={project.questions}
            onSubmit={handleAnswerSubmit}
            disabled={submitting}
          />
        )}

        {submitting && <LinearProgress sx={{ mt: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

// src/components/EvaluateClient.tsx continued - SliderForm
function SliderForm({
  questions,
  onSubmit,
  disabled = false,
}: {
  questions: Question[];
  onSubmit: (vals: { questionId: string; value: number }[]) => void;
  disabled?: boolean;
}) {
  const [values, setValues] = React.useState(
    questions.map((q) => ({ questionId: q.id, value: 0 })),
  );
  const handleChange = (index: number, val: number) =>
    setValues((vs) =>
      vs.map((v, i) => (i === index ? { ...v, value: val } : v)),
    );
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={4}>
        {questions.map((q, i) => (
          <Box key={q.id}>
            <Typography variant="h6" align="center" gutterBottom>
              {q.text}
            </Typography>
            <Slider
              value={values[i].value}
              onChange={(_, v) => handleChange(i, v as number)}
              min={-1}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              disabled={disabled}
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={disabled}
          sx={{ py: 1.5, fontSize: "1rem" }}
        >
          {disabled ? "Submitting…" : "Next"}
        </Button>
      </Stack>
    </Box>
  );
}
