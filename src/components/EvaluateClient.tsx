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
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Types
import { EvaluateClientProps, Question } from '@/types/evaluate';

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
  const t = useTranslations('evaluation');
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
          backgroundColor: '#f8f9fa',
          borderRadius: 4,
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
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
        borderRadius: 4,
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
            backgroundColor: '#f8f9fa',
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
                '0%': { opacity: 0.6 },
                '50%': { opacity: 0.8 },
                '100%': { opacity: 0.6 },
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
                backgroundColor: '#e9ecef',
                borderRadius: 4,
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
          opacity: isImageLoaded ? 1 : 0,
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
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
  // Calculate percentage
  const percentage = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  return (
    <Box
      sx={{
        width: '100%',
        mt: { xs: 2, sm: 3 },
        mb: { xs: 1, sm: 1.5 },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Custom Progress Bar Container */}
      <Box
        sx={{
          flexGrow: 1,
          height: { xs: 8, sm: 10 },
          borderRadius: 10,
          backgroundColor: 'rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress Bar Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #333333 0%, #000000 100%)',
            borderRadius: 'inherit',
            willChange: 'width',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          minWidth: { xs: 45, sm: 55 },
          textAlign: 'right',
          fontSize: { xs: '0.9rem', sm: '1.1rem' },
          fontWeight: 600,
          color: 'text.primary',
          fontFeatureSettings: '"tnum"',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.ceil(timeLeft)}
        <span style={{ fontSize: '0.7em', marginLeft: '2px', opacity: 0.7 }}>s</span>
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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: { xs: 3, sm: 4 },
        pb: { xs: 4, sm: 6 },
        maxWidth: { md: '1200px' },
        mx: 'auto',
      }}
    >
      {questions.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              height: '100%',
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: 3, sm: 4 },
              background: '#ffffff',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                lineHeight: 1.4,
                letterSpacing: '-0.02em',
              }}
            >
              {q.text}
            </Typography>
            <Box sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: '1.44rem' }, fontWeight: 500 }}>
                  {q.leftLabel || t('stronglyDisagree')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: '1.44rem' }, fontWeight: 500 }}>
                  {q.rightLabel || t('stronglyAgree')}
                </Typography>
              </Box>
              <Slider
                marks={[
                  { value: -1 },
                  { value: 0 },
                  { value: 1 },
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
                  height: 6,
                  '& .MuiSlider-thumb': {
                    width: 28,
                    height: 28,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    },
                    '&::before': {
                      display: 'none',
                    },
                  },
                  '& .MuiSlider-track': {
                    border: 'none',
                    backgroundColor: '#000',
                  },
                  '& .MuiSlider-rail': {
                    opacity: 1,
                    backgroundColor: '#e0e0e0',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: '#bfbfbf',
                    height: 8,
                    width: 8,
                    borderRadius: '50%',
                    '&.MuiSlider-markActive': {
                      opacity: 1,
                      backgroundColor: 'currentColor',
                    },
                  },
                  '& .MuiSlider-markLabel': {
                    display: 'none',
                  },
                  '& .MuiSlider-valueLabel': {
                    lineHeight: 1.2,
                    fontSize: 12,
                    background: 'unset',
                    padding: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50% 50% 50% 0',
                    backgroundColor: '#000',
                    transformOrigin: 'bottom left',
                    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
                    '&::before': { display: 'none' },
                    '&.MuiSlider-valueLabelOpen': {
                      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
                    },
                    '& > *': {
                      transform: 'rotate(45deg)',
                    },
                  },
                }}
              />
            </Box>
          </Card>
        </motion.div>
      ))}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled}
        sx={{
          gridColumn: { xs: '1', md: '1 / -1' },
          justifySelf: 'center',
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 700,
          borderRadius: 100,
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 25px rgba(0, 0, 0, 0.2)',
            background: '#1a1a1a',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&.Mui-disabled': {
            background: '#e0e0e0',
            color: '#9e9e9e',
          },
          maxWidth: '400px',
        }}
      >
        {disabled ? t('submitting') : t('next')}
      </Button>
    </Box>
  );
};

// RadioForm Component
const RadioForm = ({
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

  const radioOptions = [
    { value: -3, label: '-3' },
    { value: -2, label: '-2' },
    { value: -1, label: '-1' },
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: { xs: 3, sm: 4 },
        pb: { xs: 4, sm: 6 },
        maxWidth: { md: '1200px' },
        mx: 'auto',
      }}
    >
      {questions.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              height: '100%',
              py: { xs: 2, sm: 4, md: 5 },
              px: { xs: 1, sm: 4, md: 5 },
              borderRadius: { xs: 3, sm: 4 },
              background: '#ffffff',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                lineHeight: 1.4,
                letterSpacing: '-0.02em',
              }}
            >
              {q.text}
            </Typography>
            <Box sx={{ px: { xs: 0, sm: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: { md: '650px' }, mb: 1 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: '1.44rem' }, fontWeight: 500 }}>
                  {q.leftLabel || t('stronglyDisagree')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: '1.44rem' }, fontWeight: 500 }}>
                  {q.rightLabel || t('stronglyAgree')}
                </Typography>
              </Box>

              <RadioGroup
                row
                value={values[i].value}
                onChange={(e) => handleChange(i, parseInt(e.target.value))}
                sx={{
                  width: '100%',
                  maxWidth: { md: '650px' },
                  mx: 'auto',
                  justifyContent: 'space-between',
                  flexWrap: 'nowrap',
                  position: 'relative',
                  zIndex: 1,
                  '& .MuiFormControlLabel-root': {
                    margin: 0,
                    flexDirection: 'column-reverse',
                    gap: { xs: 0, sm: 1 },
                    minWidth: 0,
                    borderRadius: '8px',
                    padding: { xs: '4px 0', sm: '8px 12px' },
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.03)',
                    },
                  },
                  '& .MuiFormControlLabel-label': {
                    display: 'none',
                  },
                }}
              >
                {radioOptions.map((option) => {
                  const isSelected = values[i].value === option.value;
                  return (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'text.primary' : 'text.secondary',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        },
                      }}
                      control={
                        <Radio
                          sx={{
                            padding: { xs: '2px', sm: '9px' },
                            backgroundColor: '#ffffff', // White background to hide line behind
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: { xs: 38, sm: 54 },
                            },
                            '&.Mui-checked': {
                              color: '#000000',
                            },
                          }}
                        />
                      }
                      label={option.label}
                    />
                  );
                })}
              </RadioGroup>
            </Box>
          </Card>
        </motion.div>
      ))}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled}
        sx={{
          gridColumn: { xs: '1', md: '1 / -1' },
          justifySelf: 'center',
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 700,
          borderRadius: 100,
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 25px rgba(0, 0, 0, 0.2)',
            background: '#1a1a1a',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&.Mui-disabled': {
            background: '#e0e0e0',
            color: '#9e9e9e',
          },
          maxWidth: '400px',
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

  // Check for previous answers
  useEffect(() => {
    if (!project.allowMultipleAnswers) {
      const hasAnswered = localStorage.getItem(`project_answered_${project.id}`);
      if (hasAnswered) {
        setError('alreadyAnswered');
      }
    }
  }, [project.id, project.allowMultipleAnswers]);

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

  const submitAllScores = useCallback(async (all: Answer[]) => {
    setSubmitting(true);
    try {
      console.log('Submitting scores with method:', project.evaluationMethod || 'slider');
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers: all,
          evaluationMethod: project.evaluationMethod || 'slider',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit scores');

      if (!project.allowMultipleAnswers) {
        localStorage.setItem(`project_answered_${project.id}`, 'true');
      }

      router.push(`/projects/${project.id}/thanks`);
    } catch {
      setError('errorSubmitting');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, project, router]);

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
    [answers, currentIndex, imagesToShow, scrollToTop, preloadNextImage, stopTimer, submitAllScores]
  );

  // Error Handling
  if (error) {
    let errorMessage = error;
    // Try to translate if it looks like a key
    if (error === 'alreadyAnswered' || error === 'errorSubmitting') {
      // Direct mapping for fallback
      const fallbacks: Record<string, string> = {
        alreadyAnswered: 'You have already answered this survey.',
        errorSubmitting: 'Error submitting. Please try again.'
      };

      try {
        const translated = t(error);
        // Check if translation returned the key itself (common i18n behavior when missing)
        if (translated === `evaluation.${error}` || translated === error) {
          errorMessage = fallbacks[error];
        } else {
          errorMessage = translated;
        }
      } catch (e) {
        console.error('Translation error:', e);
        errorMessage = fallbacks[error];
      }
    }

    return (
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 600, md: 800 },
            p: { xs: 4, sm: 6, md: 8 },
            borderRadius: { xs: 3, sm: 4 },
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255,255,255,0.5)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: '#1a1a1a',
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.03em',
            }}
          >
            {(() => {
              if (error === 'alreadyAnswered') {
                try {
                  const translated = t('alreadyAnswered');
                  return (translated === 'evaluation.alreadyAnswered' || translated === 'alreadyAnswered')
                    ? 'Already Answered'
                    : translated;
                } catch {
                  return 'Already Answered';
                }
              }
              return t('error');
            })()}
          </Typography>

          <Typography
            variant="body1"
            gutterBottom
            sx={{
              color: '#4a4a4a',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              lineHeight: 1.8,
              mb: { xs: 4, sm: 6 },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            {errorMessage}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, sm: 3 },
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              href={`/projects/${project.id}`}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 100,
                background: '#000000',
                color: '#ffffff',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                  background: '#1a1a1a',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {t('thanks.backToProject')}
            </Button>

            <Button
              variant="outlined"
              href="/"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 100,
                borderColor: '#e0e0e0',
                color: '#1a1a1a',
                textTransform: 'none',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#000000',
                  backgroundColor: 'transparent',
                  borderWidth: '2px',
                },
              }}
            >
              {t('thanks.home')}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!imagesToShow.length)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {t('noImagesRegistered')}
      </Alert>
    );

  return (
    <Box
      ref={scrollmRef}
      sx={{
        backgroundColor: '#f8f9fa',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        pt: {
          xs: 'calc(56px + 1rem)',
          sm: 'calc(64px + 2rem)',
          md: 'calc(64px + 2rem)',
        },
        pb: {
          xs: '1rem',
          sm: '2rem',
          md: '2rem',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: 1000,
          paddingBottom: '5vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 2, sm: 4, md: 5 },
            borderRadius: { xs: 3, sm: 4 },
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            position: 'relative',
            minHeight: { xs: '80vh', md: '85vh' },
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 800,
                color: '#1a1a1a',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {t('evaluationOf', { current: currentIndex + 1, total: imagesToShow.length })}
            </Typography>
            <Divider sx={{ mb: { xs: 3, sm: 4 }, borderColor: 'rgba(0, 0, 0, 0.06)' }} />
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
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Stack
                    alignItems="center"
                    spacing={{ xs: 2, sm: 3 }}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <Card
                      ref={containerRef}
                      elevation={0}
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 850, md: 950 },
                        borderRadius: { xs: 3, sm: 4 },
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        height: 'auto',
                        maxHeight: {
                          xs: 'calc(90vh - 200px)',
                          sm: 'calc(90vh - 220px)',
                          md: 'calc(92vh - 240px)',
                        },
                        margin: '0 auto',
                        background: '#f8f9fa',
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
                            backgroundColor: '#f8f9fa',
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
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {project.evaluationMethod === 'radio' ? (
                    <RadioForm
                      questions={project.questions}
                      onSubmit={handleAnswerSubmit}
                      disabled={submitting}
                    />
                  ) : (
                    <SliderForm
                      questions={project.questions}
                      onSubmit={handleAnswerSubmit}
                      disabled={submitting}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <Box sx={{ flexShrink: 0, mt: 2 }}>
            {submitting && (
              <LinearProgress
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: '#000000',
                  },
                }}
              />
            )}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
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
