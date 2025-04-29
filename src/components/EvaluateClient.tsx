'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ImageSize {
  width: number;
  height: number;
}

export default function EvaluateClient({ project }: EvaluateClientProps) {
  const router = useRouter();
  const sessionId = useMemo(() => uuidv4(), []);
  const theme = useTheme();
  const [currentImageSize, setCurrentImageSize] = useState<ImageSize | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const imagesToShow = useMemo(
    () => project.images.slice(0, project.imageCount),
    [project.images, project.imageCount]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'showImage' | 'showSliders'>('showImage');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (phase === 'showImage') {
      const t0 = Date.now();
      setStartTime(t0);
      setNow(t0);
    }
  }, [phase]);
  useEffect(() => {
    if (phase === 'showImage' && startTime !== null) {
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
    if (phase === 'showImage' && timeLeft <= 0) setPhase('showSliders');
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase === 'showImage' && imageRef.current) {
      const img = new Image();
      img.src = imagesToShow[currentIndex].url;
      img.onload = () => {
        setCurrentImageSize({ width: img.width, height: img.height });
      };
    }
  }, [phase, currentIndex, imagesToShow]);

  if (!imagesToShow.length)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        No images registered.
      </Alert>
    );

  const handleAnswerSubmit = (vals: { questionId: string; value: number }[]) => {
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
      setPhase('showImage');
    } else {
      submitAllScores([...answers, ...batch]);
    }
  };

  const submitAllScores = async (all: Answer[]) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: all }),
      });
      if (!res.ok) throw new Error();
      router.push(`/projects/${project.id}/thanks`);
    } catch (e) {
      setError('Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateImageStyle = () => {
    if (!currentImageSize || !containerRef.current) return {};

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imageAspectRatio = currentImageSize.width / currentImageSize.height;
    const containerAspectRatio = containerWidth / containerHeight;

    let width, height;
    if (imageAspectRatio > containerAspectRatio) {
      // 画像が横長の場合
      width = '100%';
      height = `${containerWidth / imageAspectRatio}px`;
    } else {
      // 画像が縦長の場合
      height = '100%';
      width = `${containerHeight * imageAspectRatio}px`;
    }

    return {
      width,
      height,
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    };
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        width: '100%',
        minHeight: ['calc(100vh - 56px)', 'calc(100vh - 64px)'],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 1200,
          paddingTop: '8vh',
          paddingBottom: '10vh',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 'bold',
                color: '#000000',
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              Evaluation ({currentIndex + 1}/{imagesToShow.length})
            </Typography>
            <Divider sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible',
            }}
          >
            <AnimatePresence mode="wait">
              {phase === 'showImage' ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Stack
                    alignItems="center"
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <Card
                      ref={containerRef}
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 800, md: 1050 },
                        borderRadius: { xs: 2, sm: 3 },
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        aspectRatio: currentImageSize
                          ? `${currentImageSize.width} / ${currentImageSize.height}`
                          : 'auto',
                        maxHeight: 'calc(100% - 120px)',
                      }}
                    >
                      <Box
                        ref={imageRef}
                        component="img"
                        src={imagesToShow[currentIndex].url}
                        alt={`Image ${currentIndex + 1}`}
                        sx={{
                          ...calculateImageStyle(),
                          display: 'block',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          MozTouchCallout: 'none',
                          MozUserSelect: 'none',
                          userSelect: 'none',
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        onMouseDown={(e) => e.preventDefault()}
                      />
                    </Card>
                    <Box
                      sx={{
                        width: '90%',
                        position: 'relative',
                        mt: { xs: 2, sm: 3 },
                        mb: { xs: 1, sm: 2 },
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={(timeLeft / project.imageDuration) * 100}
                        sx={{
                          height: { xs: 8, sm: 10, md: 12 },
                          borderRadius: { xs: 2, sm: 3, md: 4 },
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: { xs: 2, sm: 3, md: 4 },
                            background: '#000000',
                          },
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: { xs: -24, sm: -28, md: -30 },
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: { xs: '0.25rem 0.5rem', sm: '0.375rem 0.75rem' },
                          borderRadius: { xs: 1, sm: 2 },
                        }}
                      >
                        {Math.ceil(timeLeft)}s
                      </Typography>
                    </Box>
                  </Stack>
                </motion.div>
              ) : (
                <motion.div
                  key="sliders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <SliderForm
                    questions={project.questions}
                    onSubmit={handleAnswerSubmit}
                    disabled={submitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <Box sx={{ flexShrink: 0, mt: 2 }}>
            {submitting && (
              <LinearProgress
                sx={{
                  height: { xs: 4, sm: 5, md: 6 },
                  borderRadius: { xs: 1, sm: 2 },
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: { xs: 1, sm: 2 },
                    background: '#000000',
                  },
                }}
              />
            )}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: { xs: 2, sm: 3 },
                  borderRadius: { xs: 1, sm: 2 },
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: '#000000',
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

function SliderForm({
  questions,
  onSubmit,
  disabled = false,
}: {
  questions: Question[];
  onSubmit: (vals: { questionId: string; value: number }[]) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [values, setValues] = React.useState(
    questions.map((q) => ({ questionId: q.id, value: 0 }))
  );
  const handleChange = (index: number, val: number) =>
    setValues((vs) => vs.map((v, i) => (i === index ? { ...v, value: val } : v)));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5, md: 2 },
        pb: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      {questions.map((q, i) => (
        <Card
          key={q.id}
          sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 3 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            mb: i === questions.length - 1 ? { xs: 3, sm: 4, md: 5 } : 0,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#000000',
              mb: { xs: 0.5, sm: 1, md: 1.5 },
              fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 },
            }}
          >
            {q.text}
          </Typography>
          <Slider
            marks={[
              { value: -1, label: '-1' },
              { value: 0, label: '0' },
              { value: 1, label: '1' },
            ]}
            track={false}
            value={values[i].value}
            onChange={(_, v) => handleChange(i, v as number)}
            min={-1}
            max={1}
            step={0.01}
            valueLabelDisplay="auto"
            disabled={disabled}
            sx={{
              width: '100%',
              '& .MuiSlider-thumb': {
                width: { xs: 20, sm: 30, md: 36 },
                height: { xs: 20, sm: 30, md: 36 },
                background: '#000000',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              },
              '& .MuiSlider-track': {
                background: '#000000',
                height: { xs: 3, sm: 5, md: 6 },
              },
              '& .MuiSlider-rail': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                height: { xs: 3, sm: 5, md: 6 },
              },
              '& .MuiSlider-mark': {
                width: { xs: 4, sm: 7, md: 8 },
                height: { xs: 4, sm: 7, md: 8 },
                borderRadius: '50%',
                backgroundColor: '#000000',
              },
              '& .MuiSlider-markLabel': {
                fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' },
                marginTop: { xs: 0.25, sm: 0.75, md: 1 },
              },
              '& .MuiSlider-valueLabel': {
                fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' },
                padding: { xs: '0.25rem 0.5rem', sm: '0.375rem 0.75rem', md: '0.5rem 1rem' },
              },
            }}
          />
        </Card>
      ))}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled}
        sx={{
          py: { xs: 1, sm: 2, md: 3 },
          fontSize: { xs: '0.875rem', sm: '1.25rem', md: '1.5rem' },
          fontWeight: 'bold',
          borderRadius: { xs: 2, sm: 3 },
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            background: '#000000',
          },
          '&.Mui-disabled': {
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#ffffff',
          },
        }}
      >
        {disabled ? 'Submitting…' : 'Next'}
      </Button>
    </Box>
  );
}
