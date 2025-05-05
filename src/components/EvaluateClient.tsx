'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
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
  useTheme,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Types
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

// Constants
const PHASE = {
  SHOW_IMAGE: 'showImage',
  SHOW_SLIDERS: 'showSliders',
} as const;

type Phase = (typeof PHASE)[keyof typeof PHASE];

// ImageViewer Component
const ImageViewer = ({
  imageUrl,
  index,
  onImageLoad,
  imageStyle,
}: {
  imageUrl: string;
  index: number;
  onImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  imageStyle: React.CSSProperties;
}) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={imageContainerRef}
      sx={{
        ...imageStyle,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        MozTouchCallout: 'none',
        MozUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Image
        src={imageUrl}
        alt={`Image ${index + 1}`}
        width={parseInt(imageStyle.width as string) || 500}
        height={parseInt(imageStyle.height as string) || 300}
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
          maxWidth: imageStyle.width || '100%',
          maxHeight: imageStyle.height || '100%',
        }}
        priority
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 80vw, 850px"
        onLoad={onImageLoad}
      />
    </Box>
  );
};

// Timer Component
const TimerProgress = ({
  timeLeft,
  totalDuration,
}: {
  timeLeft: number;
  totalDuration: number;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        mt: { xs: 1.5, sm: 3 },
        mb: { xs: 0.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <LinearProgress
        variant="determinate"
        value={(timeLeft / totalDuration) * 100}
        sx={{
          flexGrow: 1,
          height: { xs: 6, sm: 10, md: 12 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: '#000000',
          },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          minWidth: { xs: 40, sm: 48, md: 56 },
          textAlign: 'right',
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
          color: 'rgba(0,0,0,0.6)',
        }}
      >
        {Math.ceil(timeLeft)}s
      </Typography>
    </Box>
  );
};

// SliderForm Component
const SliderForm = ({
  questions,
  onSubmit,
  disabled = false,
}: {
  questions: Question[];
  onSubmit: (vals: { questionId: string; value: number }[]) => void;
  disabled?: boolean;
}) => {
  const [values, setValues] = useState(questions.map((q) => ({ questionId: q.id, value: 0 })));

  const handleChange = useCallback((index: number, val: number) => {
    setValues((vs) => vs.map((v, i) => (i === index ? { ...v, value: val } : v)));
  }, []);

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
        maxWidth: { md: '850px' },
        mx: 'auto',
      }}
    >
      {questions.map((q, i) => (
        <Card
          key={q.id}
          sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 2.5 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            mb: i === questions.length - 1 ? { xs: 3, sm: 3.5, md: 4 } : 0,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#000000',
              mb: { xs: 0.5, sm: 1, md: 1.25 },
              fontSize: { xs: '1rem', sm: '1.35rem', md: '1.65rem' },
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
                width: { xs: 20, sm: 26, md: 32 },
                height: { xs: 20, sm: 26, md: 32 },
                background: '#000000',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              },
              '& .MuiSlider-track': {
                background: '#000000',
                height: { xs: 3, sm: 4, md: 5 },
              },
              '& .MuiSlider-rail': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                height: { xs: 3, sm: 4, md: 5 },
              },
              '& .MuiSlider-mark': {
                width: { xs: 4, sm: 6, md: 7 },
                height: { xs: 4, sm: 6, md: 7 },
                borderRadius: '50%',
                backgroundColor: '#000000',
              },
              '& .MuiSlider-markLabel': {
                fontSize: { xs: '0.75rem', sm: '0.95rem', md: '1.1rem' },
                marginTop: { xs: 0.25, sm: 0.5, md: 0.8 },
              },
              '& .MuiSlider-valueLabel': {
                fontSize: { xs: '0.75rem', sm: '0.95rem', md: '1.1rem' },
                padding: { xs: '0.25rem 0.5rem', sm: '0.35rem 0.65rem', md: '0.45rem 0.85rem' },
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
          py: { xs: 1, sm: 1.5, md: 2.25 },
          fontSize: { xs: '0.875rem', sm: '1.15rem', md: '1.35rem' },
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
          maxWidth: { md: '450px' },
        }}
      >
        {disabled ? 'Submitting…' : 'Next'}
      </Button>
    </Box>
  );
};

export default function EvaluateClient({ project }: EvaluateClientProps) {
  const router = useRouter();
  const sessionId = useMemo(() => uuidv4(), []);
  const [currentImageSize, setCurrentImageSize] = useState<ImageSize | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollmRef = useRef<HTMLDivElement>(null);

  // 配列をシャッフルするヘルパー関数
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    // 配列のコピーを作成
    const newArray = [...array];
    // Fisher-Yatesアルゴリズムでシャッフル
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // State
  // 画像をランダム順に表示 - 初期化時に1回だけシャッフル
  const imagesToShow = useMemo(() => {
    // 画像を完全にランダムにするため、毎回シャッフルする
    const shuffledImages = shuffleArray(project.images);

    // 指定された数だけ取得
    return shuffledImages.slice(0, project.imageCount);
  }, [project.images, project.imageCount, shuffleArray]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(PHASE.SHOW_IMAGE);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Timer Management
  useEffect(() => {
    if (phase === PHASE.SHOW_IMAGE) {
      const t0 = Date.now();
      setStartTime(t0);
      setNow(t0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === PHASE.SHOW_IMAGE && startTime !== null) {
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
    if (phase === PHASE.SHOW_IMAGE && timeLeft <= 0) setPhase(PHASE.SHOW_SLIDERS);
  }, [phase, timeLeft]);

  // Reset currentImageSize when currentIndex changes
  useEffect(() => {
    setCurrentImageSize(null);
  }, [currentIndex]);

  // Handle window resize - recalculate optimal image size when window dimensions change
  useEffect(() => {
    const handleResize = () => {
      // Force recalculation of image dimensions by temporarily clearing currentImageSize
      setCurrentImageSize((prev) => {
        if (prev) {
          // Preserve the original dimensions for recalculation
          const dimensions = { ...prev };
          // Reset and then immediately restore with new calculations
          setTimeout(() => setCurrentImageSize(dimensions), 0);
          return null;
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Image Preloading
  useEffect(() => {
    if (phase === PHASE.SHOW_IMAGE) {
      // For preloading the next image if needed
      const nextIndex = currentIndex + 1;
      if (nextIndex < imagesToShow.length) {
        const preloadImage = new window.Image();
        preloadImage.src = imagesToShow[nextIndex].url;
      }
    }
  }, [phase, currentIndex, imagesToShow]);

  // Scroll Management
  useEffect(() => {
    if (phase === PHASE.SHOW_IMAGE) {
      forceScrollToTop();
    }
  }, [phase, currentIndex]);

  const forceScrollToTop = useCallback(() => {
    // 複数回呼び出して確実にスクロールさせる
    scrollToTopImmediate();
    setTimeout(() => scrollToTopImmediate(), 50);
    setTimeout(() => scrollToTopImmediate(), 150);

    // デバイスサイズに関係なく、ヘッダー直下に確実にスクロールするための追加処理
    setTimeout(() => {
      if (scrollmRef.current) {
        scrollmRef.current.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    }, 250);
  }, []);

  const scrollToTopImmediate = useCallback(() => {
    if (scrollmRef.current) {
      scrollmRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = useCallback(() => {
    forceScrollToTop();
  }, [forceScrollToTop]);

  // Error Handling
  if (!imagesToShow.length)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        No images registered.
      </Alert>
    );

  // Event Handlers
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    // Always update the image size for the current image
    setCurrentImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }, []);

  const handleAnswerSubmit = useCallback(
    (vals: { questionId: string; value: number }[]) => {
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
        setPhase(PHASE.SHOW_IMAGE);
        scrollToTop();
      } else {
        submitAllScores([...answers, ...batch]);
      }
    },
    [answers, currentIndex, imagesToShow, scrollToTop]
  );

  const submitAllScores = async (all: Answer[]) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: all }),
      });
      if (!res.ok) throw new Error('Failed to submit scores');
      router.push(`/projects/${project.id}/thanks`);
    } catch (e) {
      setError('Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateImageStyle = useCallback(() => {
    if (!currentImageSize || !containerRef.current) return {};

    // Get the available viewport height - use maximum possible screen space
    const viewportHeight = window.innerHeight;
    // Reduce margin/padding estimates to allow for more image space
    const headerHeight = 80;
    const timerHeight = 50;
    const paddingHeight = 50;

    // Calculate the maximum available height - use as much space as possible
    const maxAvailableHeight = viewportHeight - headerHeight - timerHeight - paddingHeight;

    // Get container width - maximum width available
    const containerWidth = containerRef.current.clientWidth;

    // Get image aspect ratio
    const imageAspectRatio = currentImageSize.width / currentImageSize.height;

    let width, height;

    // For wider images - prioritize filling the width
    if (imageAspectRatio > 1) {
      // Use full container width
      width = containerWidth;
      height = width / imageAspectRatio;

      // If height can grow more, scale it up to fill maximum height
      if (height < maxAvailableHeight) {
        height = maxAvailableHeight;
        width = height * imageAspectRatio;

        // If new width exceeds container, scale back down
        if (width > containerWidth) {
          width = containerWidth;
          height = width / imageAspectRatio;
        }
      }
    }
    // For taller images - prioritize filling the height
    else {
      // Use maximum height first
      height = maxAvailableHeight;
      width = height * imageAspectRatio;

      // If width exceeds container, scale down to fit
      if (width > containerWidth) {
        width = containerWidth;
        height = width / imageAspectRatio;
      }
    }

    // Return precise dimensions (round down to avoid scrollbars)
    return {
      width: `${Math.floor(width)}px`,
      height: `${Math.floor(height)}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain' as const,
    };
  }, [currentImageSize]);

  return (
    <Box
      ref={scrollmRef}
      sx={{
        backgroundColor: '#f5f5f5',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 1, sm: 2, md: 2.5 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        pt: {
          xs: 'calc(56px + 0.75rem)',
          sm: 'calc(64px + 0.5rem)',
          md: 'calc(64px + 0.75rem)',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 1000,
          paddingTop: '0',
          paddingBottom: '5vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 2.5 },
            borderRadius: { xs: 2, sm: 3, md: 3 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            mt: { xs: 0, sm: 0 },
            position: 'relative',
            minHeight: '80vh',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: 0,
              right: 0,
              height: 10,
              background: 'transparent',
            },
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
                mb: { xs: 1, sm: 2, md: 2.5 },
                fontSize: { xs: '1.25rem', sm: '1.6rem', md: '1.85rem' },
              }}
            >
              Evaluation ({currentIndex + 1}/{imagesToShow.length})
            </Typography>
            <Divider sx={{ mb: { xs: 1, sm: 2, md: 2.5 }, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
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
              {phase === PHASE.SHOW_IMAGE ? (
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
                    spacing={{ xs: 1.5, sm: 2.5, md: 3 }}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <Card
                      ref={containerRef}
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 850, md: 950 },
                        borderRadius: { xs: 2, sm: 3 },
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        height: 'auto',
                        maxHeight: {
                          xs: 'calc(90vh - 160px)',
                          sm: 'calc(90vh - 120px)',
                          md: 'calc(90vh - 100px)',
                        },
                        margin: '0 auto',
                      }}
                    >
                      <ImageViewer
                        imageUrl={imagesToShow[currentIndex].url}
                        index={currentIndex}
                        onImageLoad={handleImageLoad}
                        imageStyle={calculateImageStyle()}
                      />
                    </Card>

                    <TimerProgress timeLeft={timeLeft} totalDuration={project.imageDuration} />
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
