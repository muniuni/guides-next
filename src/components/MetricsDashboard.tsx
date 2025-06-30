'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
  Divider,
  Avatar,
  Stack,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip as MUITooltip,
  CircularProgress,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ImageIcon from '@mui/icons-material/Image';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import useMediaQuery from '@mui/material/useMediaQuery';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// コンポーネントのインポート - 動的読み込みに変更
const SummaryCard = lazy(() => import('./metrics/SummaryCard'));
const MonthlyChart = lazy(() => import('./metrics/MonthlyChart'));
const ImageScoreChart = lazy(() => import('./metrics/ImageScoreChart'));
const QuestionScorePanel = lazy(() => import('./metrics/QuestionScorePanel'));
const MobileMetricsTabs = lazy(() => import('./metrics/MobileMetricsTabs'));

// 型定義のインポート
import { ApiResponse, MetricsDashboardProps } from '@/types/metrics';

// Suspenseのフォールバックコンポーネント
const ChartLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 200,
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 10,
    }}
  >
    <CircularProgress size={30} />
  </Box>
);

export default function MetricsDashboard({ data, projectId }: MetricsDashboardProps) {
  const theme = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState('1');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setMobileTab(newValue);
  };

  const handleExportCSV = () => {
    if (!projectId) return;
    window.open(`/api/projects/${projectId}/export-csv`, '_blank');
  };

  if (!data) {
    return (
      <Box p={3}>
        <Typography color="error">
          Failed to load metrics – data is undefined. Make sure the parent page passes the{' '}
          <code>data</code> prop as shown in the README.
        </Typography>
      </Box>
    );
  }

  // データの処理をuseMemoで最適化
  const {
    monthlyData,
    perImageData,
    avgByQuestionData,
    uniqueRespondents,
    totalScores,
    totalImages,
    totalQuestions,
    imageQuestionData,
  } = useMemo(() => {
    // 過去6ヶ月のデータを取得
    const getLastSixMonths = () => {
      const months = [];
      const today = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
      return months.reverse();
    };

    // 月間データを生成
    const monthlyData = (() => {
      const lastSixMonths = getLastSixMonths();
      const existingData = (data.monthly ?? []).reduce(
        (acc, curr) => {
          acc[curr.month] = curr.count;
          return acc;
        },
        {} as Record<string, number>
      );

      return lastSixMonths.map((month) => ({
        month,
        count: existingData[month] || 0,
      }));
    })();

    // 画像ごとのスコアデータを生成
    const perImageData = (data.perImage ?? []).map((img) => ({
      id: img.id,
      image: img.url || img.id,
      count: img._count.scores,
    }));

    // 質問ごとのスコアデータを生成
    const avgByQuestionData = (data.avgByQuestion ?? []).map((q) => ({
      question: q.question.length > 20 ? `${q.question.slice(0, 17)}…` : q.question,
      avg: Number(Number(q.avg).toFixed(2)),
    }));

    // 画像ごとの質問データを生成
    const hasPerImageQuestionData =
      data.questionScoresPerImage && data.questionScoresPerImage.length > 0;

    // 画像ごとの質問スコアデータを構成
    const imageQuestionData = hasPerImageQuestionData
      ? perImageData.map((img) => {
          // この画像のスコアをすべて見つける
          const questionsForImage = data.questionScoresPerImage!.filter(
            (q) => q.imageId === img.id
          );

          // 必要な形式にマッピング
          const questions = (data.avgByQuestion ?? []).map((question) => {
            const questionScore = questionsForImage.find(
              (q) => q.questionId === question.questionId
            );
            return {
              question: question.question,
              questionId: question.questionId,
              avg: questionScore ? questionScore.avg : null,
            };
          });

          return {
            ...img,
            questions,
          };
        })
      : null;

    // 集計指標を計算
    const uniqueRespondents = data.uniqueRespondents;
    const totalScores = data.totalScores ?? 0;
    const totalImages = perImageData.length;
    const totalQuestions = avgByQuestionData.length;

    return {
      monthlyData,
      perImageData,
      avgByQuestionData,
      uniqueRespondents,
      totalScores,
      totalImages,
      totalQuestions,
      imageQuestionData,
    };
  }, [data]);

  // モバイル用UI
  if (isMobile) {
    return (
      <Box sx={{ p: 2, maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Metrics Dashboard</Typography>
          {projectId && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ fontSize: 13, textTransform: 'none' }}
            >
              Export CSV
            </Button>
          )}
        </Box>

        <Suspense fallback={<ChartLoader />}>
          {/* サマリーカード（横スクロール可能なカード列） */}
          <Box sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1.5, width: 'max-content', minWidth: '100%' }}>
              <SummaryCard
                title="Respondents"
                value={uniqueRespondents !== undefined ? uniqueRespondents : 'N/A'}
                icon={<PeopleOutlineIcon sx={{ fontSize: 18 }} />}
                tooltip="This is an approximate count calculated from session IDs"
                isMobile={true}
              />
              <SummaryCard
                title="Total Scores"
                value={totalScores}
                icon={<BarChartIcon sx={{ fontSize: 18 }} />}
                isMobile={true}
              />
              <SummaryCard
                title="Total Images"
                value={totalImages}
                icon={<ImageIcon sx={{ fontSize: 18 }} />}
                isMobile={true}
              />
              <SummaryCard
                title="Total Questions"
                value={totalQuestions}
                icon={<QuizIcon sx={{ fontSize: 18 }} />}
                isMobile={true}
              />
            </Box>
          </Box>

          {/* タブ付きメトリクス */}
          <MobileMetricsTabs
            monthlyData={monthlyData}
            perImageData={perImageData}
            imageQuestionData={imageQuestionData}
          />
        </Suspense>
      </Box>
    );
  }

  // デスクトップ用UI
  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 2 },
        }}
      >
        <Typography variant="h4" fontSize={{ xs: 22, sm: 28 }}>
          Metrics Dashboard
        </Typography>
        {projectId && (
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{ textTransform: 'none' }}
          >
            Export CSV
          </Button>
        )}
      </Box>

      <Suspense fallback={<ChartLoader />}>
        {/* サマリーカード */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 2, md: 3 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <SummaryCard
            title="Respondents"
            value={uniqueRespondents !== undefined ? uniqueRespondents : 'N/A'}
            icon={<PeopleOutlineIcon />}
            tooltip="This is an approximate count calculated from session IDs"
          />
          <SummaryCard title="Records" value={totalScores} icon={<BarChartIcon />} />
          <SummaryCard title="Total Images" value={totalImages} icon={<ImageIcon />} />
          <SummaryCard title="Total Questions" value={totalQuestions} icon={<QuizIcon />} />
        </Box>

        {/* チャート */}
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {/* 月間スコア */}
          <MonthlyChart data={monthlyData} />

          {/* 下部チャート（デスクトップではグリッド表示） */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 2,
            }}
          >
            {/* 画像ごとのスコア */}
            <ImageScoreChart data={perImageData} />

            {/* 質問ごとのスコア */}
            <QuestionScorePanel data={imageQuestionData} />
          </Box>
        </Stack>
      </Suspense>
    </Box>
  );
}
