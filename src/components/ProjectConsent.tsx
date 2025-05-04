'use client';

import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface ProjectConsentProps {
  projectId: string;
}

export default function ProjectConsent({ projectId }: ProjectConsentProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const router = useRouter();

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreed(e.target.checked);
  };

  const handleStart = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadedImages(0);

    try {
      // プロジェクト情報を取得
      const projectResponse = await fetch(`/api/projects/${projectId}/evaluate-data`);

      if (!projectResponse.ok) {
        throw new Error('Failed to load project data');
      }

      const projectData = await projectResponse.json();

      // 読み込む画像の総数を設定
      const imagesToLoad = projectData.images.slice(0, projectData.imageCount);
      setTotalImages(imagesToLoad.length);

      // すべての画像を事前にプリロード
      await Promise.all(
        imagesToLoad.map((image: { url: string }) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages((prev) => {
                const newCount = prev + 1;
                setLoadingProgress((newCount / imagesToLoad.length) * 100);
                return newCount;
              });
              resolve(null);
            };
            img.onerror = () => {
              setLoadedImages((prev) => {
                const newCount = prev + 1;
                setLoadingProgress((newCount / imagesToLoad.length) * 100);
                return newCount;
              });
              resolve(null); // エラーが起きても続行
            };
            img.src = image.url;
          });
        })
      );

      // 画像のプリロードが完了したら評価ページに移動
      router.push(`/projects/${projectId}/evaluate`);
    } catch (error) {
      console.error('Error preloading images:', error);
      // エラーがあっても評価ページに移動
      router.push(`/projects/${projectId}/evaluate`);
    }
  };

  return (
    <Box mt={4}>
      <FormControlLabel
        control={<Checkbox checked={agreed} onChange={handleCheckbox} />}
        label="I agree to participate in this evaluation"
      />
      <Box mt={2} display="flex" alignItems="center">
        <Button
          variant="contained"
          disabled={!agreed || loading}
          onClick={handleStart}
          sx={{
            minWidth: '180px',
            height: '48px',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '12px 24px',
          }}
        >
          {loading ? 'Loading Images...' : 'Start Evaluation'}
        </Button>

        {loading && (
          <Stack direction="row" spacing={1.5} alignItems="center" ml={2}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={30}
                thickness={3}
                sx={{
                  color: 'rgba(0, 0, 0, 0.1)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
              <CircularProgress
                variant="determinate"
                value={loadingProgress}
                size={30}
                thickness={3}
                sx={{
                  color: '#000000',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.primary" fontWeight="medium">
              {Math.round(loadingProgress)}%
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
