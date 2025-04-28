"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Slider,
  Button,
  LinearProgress,
  Alert,
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

  const imagesToShow = useMemo<ImageItem[]>(() => {
    if (!project.images.length) return [];
    return project.images.slice(0, project.imageCount);
  }, [project.images, project.imageCount]);

  const imageCount = imagesToShow.length;
  const { imageDuration, questions } = project;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"showImage" | "showSliders">("showImage");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (phase === "showImage") {
      const t0 = Date.now();
      setStartTime(t0);
      setNow(t0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "showImage" || startTime === null) return;
    let rafId: number;
    const tick = () => {
      setNow(Date.now());
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafId);
  }, [phase, startTime]);

  const elapsed = startTime !== null ? (now - startTime) / 1000 : 0;
  const timeLeft = Math.max(imageDuration - elapsed, 0);

  useEffect(() => {
    if (phase === "showImage" && timeLeft <= 0) {
      setPhase("showSliders");
    }
  }, [phase, timeLeft]);

  if (imagesToShow.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        プロジェクトに評価用の画像が登録されていません。管理画面で画像を追加してください。
      </Alert>
    );
  }

  const handleAnswerSubmit = (
    vals: { questionId: string; value: number }[],
  ) => {
    const batch: Answer[] = vals.map((v) => ({
      imageId: imagesToShow[currentIndex].id,
      questionId: v.questionId,
      value: v.value,
    }));
    setAnswers((prev) => [...prev, ...batch]);

    if (currentIndex + 1 < imageCount) {
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push(`/projects/${project.id}/thanks`);
    } catch (e: any) {
      console.error(e);
      setError("送信中にエラーが発生しました。再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" mt={4}>
      {error && <Alert severity="error">{error}</Alert>}

      {phase === "showImage" && (
        <Box textAlign="center">
          <img
            src={imagesToShow[currentIndex].url}
            alt={`Image ${currentIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "60vh",
              marginBottom: "1rem",
            }}
          />
          <LinearProgress
            variant="determinate"
            value={(timeLeft / imageDuration) * 100}
            sx={{ mt: 2, height: 8, borderRadius: 4, transition: "none" }}
          />
        </Box>
      )}

      {phase === "showSliders" && (
        <SliderForm
          questions={questions}
          onSubmit={handleAnswerSubmit}
          disabled={submitting}
        />
      )}

      {submitting && (
        <Box textAlign="center" mt={2}>
          <LinearProgress sx={{ height: 4 }} />
          <Typography>Submitting...</Typography>
        </Box>
      )}
    </Box>
  );
}

type SliderFormProps = {
  questions: Question[];
  onSubmit: (vals: { questionId: string; value: number }[]) => void;
  disabled?: boolean;
};

function SliderForm({
  questions,
  onSubmit,
  disabled = false,
}: SliderFormProps) {
  const [values, setValues] = useState(
    questions.map((q) => ({ questionId: q.id, value: 0 })),
  );

  const handleChange = (index: number, val: number) => {
    setValues((vs) => {
      const copy = [...vs];
      copy[index] = { questionId: vs[index].questionId, value: val };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={10}>
      {questions.map((q, i) => (
        <Box key={q.id} mb={3}>
          <Typography gutterBottom align="center" variant="h6">
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
            track={false}
            marks={[
              { value: 0, label: "0" },
              { value: -1, label: "-1" },
              { value: 1, label: "1" },
            ]}
          />
        </Box>
      ))}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled}
        sx={{ mt: 3 }}
      >
        {disabled ? "Submitting…" : "Next"}
      </Button>
    </Box>
  );
}
