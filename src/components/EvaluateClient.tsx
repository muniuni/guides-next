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
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

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
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Handle image load event
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    onImageLoad(event);
    setIsImageLoaded(true);
  };

  // 空のURLが渡された場合に、代替表示を行う
  if (!imageUrl || imageUrl.trim() === '') {
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
          backgroundColor: '#f0f0f0',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {t('imageNotAvailable')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={imageContainerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        MozTouchCallout: 'none',
        MozUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {!isImageLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              animation: 'pulse 1.5s ease-in-out 0.5s infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.6,
                },
                '50%': {
                  opacity: 0.8,
                },
                '100%': {
                  opacity: 0.6,
                },
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
                height: '40%',
                backgroundColor: '#ebebeb',
                borderRadius: 2,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '10%',
                backgroundColor: '#ebebeb',
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      )}
      <Image
        src={imageUrl}
        alt={`Image ${index + 1}`}
        width={parseInt(imageStyle.width as string) || 500}
        height={parseInt(imageStyle.height as string) || 300}
        style={{
          objectFit: 'contain',
          width: imageStyle.width || 'auto',
          height: imageStyle.height || 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          opacity: isImageLoaded ? 1 : 0, // Hide image until loaded
          transition: 'opacity 0.3s ease-in-out',
        }}
        priority
        fetchPriority="high"
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 80vw, 850px"
        onLoad={handleImageLoad}
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
        // PC版ではマージンをより少なく
        mt: { xs: 1.5, sm: 2, md: 1, lg: 1 },
        mb: { xs: 0.5, sm: 1, md: 0.5, lg: 0.5 },
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
  const t = useTranslations('evaluation');
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
        overflow: 'auto',
        // Hide scrollbar for all browsers
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
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
              width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 48px)', md: 'calc(100% - 64px)' }, // Reduce width to account for margins
              mx: { xs: 2, sm: 3, md: 4 }, // Add horizontal margins
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
        {disabled ? t('submitting') : t('next')}
      </Button>
    </Box>
  );
};

export default function EvaluateClient({ project }: EvaluateClientProps) {
  const t = useTranslations('evaluation');
  const router = useRouter();
  const sessionId = useMemo(() => uuidv4(), []);
  const [currentImageSize, setCurrentImageSize] = useState<ImageSize | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollmRef = useRef<HTMLDivElement>(null);

  // Add global style to hide scrollbars
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.innerHTML = `
      body, html, div {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      body::-webkit-scrollbar, html::-webkit-scrollbar, div::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
        background: transparent !important;
      }
      * {
        -webkit-overflow-scrolling: touch;
      }
    `;
    // Append to document head
    document.head.appendChild(style);

    // Also apply directly to body
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.head.removeChild(style);
      document.body.style.overflow = '';
    };
  }, []);

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
    // 無効なURLを持つ画像を除外
    const validImages = project.images.filter((img) => img.url && img.url.trim() !== '');

    // 画像を完全にランダムにするため、毎回シャッフルする
    const shuffledImages = shuffleArray(validImages);

    // 指定された数だけ取得
    return shuffledImages.slice(0, project.imageCount);
  }, [project.images, project.imageCount, shuffleArray]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(PHASE.SHOW_IMAGE);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerState, setTimerState] = useState<{
    isRunning: boolean;
    startTime: number | null;
    currentTime: number;
  }>({
    isRunning: false,
    startTime: null,
    currentTime: Date.now(),
  });
  const [, setIsCurrentImageLoaded] = useState(false);

  // Start timer when image loads
  const startTimer = useCallback(() => {
    const now = Date.now();
    setTimerState({
      isRunning: true,
      startTime: now,
      currentTime: now,
    });
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerState({
      isRunning: false,
      startTime: null,
      currentTime: Date.now(),
    });
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!timerState.isRunning || timerState.startTime === null) return;

    let rafId: number;
    const tick = () => {
      setTimerState((prev) => ({
        ...prev,
        currentTime: Date.now(),
      }));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [timerState.isRunning, timerState.startTime]);

  // Calculate elapsed time and time left
  const elapsed =
    timerState.isRunning && timerState.startTime
      ? (timerState.currentTime - timerState.startTime) / 1000
      : 0;
  const timeLeft = Math.max(project.imageDuration - elapsed, 0);

  // Auto-transition to sliders when timer ends
  useEffect(() => {
    if (phase === PHASE.SHOW_IMAGE && timerState.isRunning && timeLeft <= 0) {
      stopTimer();
      setPhase(PHASE.SHOW_SLIDERS);
    }
  }, [phase, timerState.isRunning, timeLeft, stopTimer]);

  // Reset states when currentIndex changes
  useEffect(() => {
    setCurrentImageSize(null);
    setIsCurrentImageLoaded(false);
    resetTimer();
  }, [currentIndex, resetTimer]);

  // Handle window resize - recalculate optimal image size when window dimensions change
  useEffect(() => {
    const handleResize = () => {
      // Simple force re-render to recalculate image style
      if (currentImageSize) {
        setCurrentImageSize({ ...currentImageSize });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentImageSize]);

  // Preload next image function
  const preloadNextImage = useCallback(
    (nextIndex: number) => {
      if (nextIndex < imagesToShow.length) {
        const nextImageUrl = imagesToShow[nextIndex].url;
        if (nextImageUrl && nextImageUrl.trim() !== '') {
          const preloadImage = new window.Image();
          preloadImage.src = nextImageUrl;
        }
      }
    },
    [imagesToShow]
  );

  // Preload first image on component mount
  useEffect(() => {
    if (imagesToShow.length > 0) {
      const firstImageUrl = imagesToShow[0].url;
      if (firstImageUrl && firstImageUrl.trim() !== '') {
        const preloadImage = new window.Image();
        preloadImage.src = firstImageUrl;
      }
    }
  }, [imagesToShow]);

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
        {t('noImagesRegistered')}
      </Alert>
    );

  // Event Handlers
  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.target as HTMLImageElement;

      // Set image dimensions
      setCurrentImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      // Mark image as loaded and start timer
      setIsCurrentImageLoaded(true);
      if (phase === PHASE.SHOW_IMAGE) {
        startTimer();
      }
    },
    [phase, startTimer]
  );

  const handleAnswerSubmit = useCallback(
    (vals: { questionId: string; value: number }[]) => {
      const batch = vals.map((v) => ({
        imageId: imagesToShow[currentIndex].id,
        questionId: v.questionId,
        value: v.value,
      }));
      setAnswers((prev) => [...prev, ...batch]);

      if (currentIndex + 1 < imagesToShow.length) {
        const nextIndex = currentIndex + 1;
        // Preload the next image before transitioning
        preloadNextImage(nextIndex);

        // Stop current timer and reset
        stopTimer();
        setCurrentIndex(nextIndex);
        setPhase(PHASE.SHOW_IMAGE);
        scrollToTop();
      } else {
        submitAllScores([...answers, ...batch]);
      }
    },
    [answers, currentIndex, imagesToShow, scrollToTop, preloadNextImage, stopTimer]
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
    } catch {
      setError(t('errorSubmitting'));
    } finally {
      setSubmitting(false);
    }
  };

  const calculateImageStyle = useCallback(() => {
    if (!currentImageSize || !containerRef.current) return {};

    // Get the actual container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Add some padding to ensure image doesn't touch the edges
    const padding = 16; // 8px padding on each side
    const maxWidth = containerWidth - padding;
    const maxHeight = containerHeight - padding;

    // Get image aspect ratio
    const imageAspectRatio = currentImageSize.width / currentImageSize.height;

    let width, height;

    // Calculate dimensions to fit within container while maintaining aspect ratio
    if (maxWidth / maxHeight > imageAspectRatio) {
      // Container is wider than image aspect ratio - limit by height
      height = maxHeight;
      width = height * imageAspectRatio;
    } else {
      // Container is taller than image aspect ratio - limit by width
      width = maxWidth;
      height = width / imageAspectRatio;
    }

    // Ensure dimensions don't exceed container
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    // Return precise dimensions
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
        p: { xs: 1, sm: 2, md: 1.5 }, // PC版では余白を少なく
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
          md: 'calc(64px + 0.5rem)', // PC版では上部余白を少なく
        },
        pb: {
          xs: '0.75rem',
          sm: '1rem',
          md: '0.5rem', // PC版では下部余白を少なく
          lg: '0.5rem',
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
          overflow: 'hidden',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 2 },
            borderRadius: { xs: 2, sm: 3, md: 3 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            mt: { xs: 0, sm: 0 },
            position: 'relative',
            // PC版では最小高さを調整して画面ギリギリに表示
            minHeight: { xs: '80vh', md: '85vh', lg: '88vh' },
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
              {t('evaluationOf', { current: currentIndex + 1, total: imagesToShow.length })}
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
                    spacing={{ xs: 1.5, sm: 2, md: 1.5 }}
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
                          sm: 'calc(90vh - 180px)',
                          md: 'calc(92vh - 190px)', // プログレスバーとその余白（約70px）を考慮
                          lg: 'calc(94vh - 200px)', // 大画面でも同様に
                        },
                        margin: '0 auto',
                      }}
                    >
                      {imagesToShow[currentIndex] && imagesToShow[currentIndex].url ? (
                        <ImageViewer
                          imageUrl={imagesToShow[currentIndex].url}
                          index={currentIndex}
                          onImageLoad={handleImageLoad}
                          imageStyle={calculateImageStyle()}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#f0f0f0',
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            {t('imageNotAvailable')}
                          </Typography>
                        </Box>
                      )}
                    </Card>

                    <TimerProgress
                      timeLeft={timerState.isRunning ? timeLeft : project.imageDuration}
                      totalDuration={project.imageDuration}
                    />
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
