'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
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
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ImageIcon from '@mui/icons-material/Image';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

export interface PerImage {
  id: string;
  url: string | null;
  _count: { scores: number };
}
export interface Monthly {
  month: string;
  count: number;
}
export interface AvgByQuestion {
  questionId: string;
  question: string;
  avg: number;
}

export interface QuestionScorePerImage {
  imageId: string;
  questionId: string;
  avg: number;
}

export interface ApiResponse {
  perImage: PerImage[];
  monthly: Monthly[];
  avgByQuestion: AvgByQuestion[];
  uniqueRespondents?: number;
  questionScoresPerImage?: QuestionScorePerImage[]; // Added this field for per-image question scores
}

export interface MetricsDashboardProps {
  data?: ApiResponse; // data may be undefined if fetch failed
}

export default function MetricsDashboard({ data }: MetricsDashboardProps) {
  const theme = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // --- Safe defaults ----------------------------------------------------
  const getLastSixMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toISOString().slice(0, 7)); // Format: YYYY-MM
    }
    return months.reverse();
  };

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

  const perImageData = (data.perImage ?? []).map((img) => ({
    id: img.id,
    image: img.url || img.id,
    count: img._count.scores,
  }));

  // Organize question data per image if available, otherwise set to null
  const hasPerImageQuestionData =
    data.questionScoresPerImage && data.questionScoresPerImage.length > 0;

  // Generate organized data structure for images and their question scores
  const imageQuestionData = hasPerImageQuestionData
    ? perImageData.map((img) => {
        // Find all scores for this image
        const questionsForImage = data.questionScoresPerImage!.filter((q) => q.imageId === img.id);

        // Map to the format we need
        const questions = (data.avgByQuestion ?? []).map((question) => {
          const questionScore = questionsForImage.find((q) => q.questionId === question.questionId);
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

  const avgByQuestionData = (data.avgByQuestion ?? []).map((q) => ({
    question: q.question.length > 20 ? `${q.question.slice(0, 17)}…` : q.question,
    avg: Number(Number(q.avg).toFixed(2)),
  }));

  // Calculate summary metrics
  const uniqueRespondents = data.uniqueRespondents;
  const totalScores = monthlyData.reduce((sum, month) => sum + month.count, 0);
  const totalImages = perImageData.length;
  const totalQuestions = avgByQuestionData.length;

  // Only set selectedImage if we have data
  const selectedImage =
    imageQuestionData && imageQuestionData.length > 0
      ? imageQuestionData[selectedImageIndex] || imageQuestionData[0]
      : null;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" mb={2}>
        Metrics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Unique Respondents Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2 }}>
                <PeopleOutlineIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Unique Respondents
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium">
                  {uniqueRespondents !== undefined ? uniqueRespondents : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Total Scores Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2 }}>
                <BarChartIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Scores
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium">
                  {totalScores}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Total Images Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2 }}>
                <ImageIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Images
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium">
                  {totalImages}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Total Questions Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2 }}>
                <QuizIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium">
                  {totalQuestions}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Stack spacing={3}>
        {/* Monthly Scores */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Total Scores
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Last 6 months of scoring activity
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box height={450}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                  <XAxis dataKey="month" stroke="rgba(0, 0, 0, 0.6)" />
                  <YAxis
                    allowDecimals={false}
                    padding={{ top: 20 }}
                    domain={[0, 'dataMax + 1']}
                    stroke="rgba(0, 0, 0, 0.6)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#000" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Lower charts in a row on desktop, stacked on mobile */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
          }}
        >
          {/* Scores Per Image */}
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Scores per Image
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Distribution of scores across images
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box flex={1} minHeight={450}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={perImageData}
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="rgba(0, 0, 0, 0.1)"
                    />
                    <XAxis type="number" allowDecimals={false} stroke="rgba(0, 0, 0, 0.6)" />
                    <YAxis
                      dataKey="image"
                      type="category"
                      width={60}
                      stroke="rgba(0, 0, 0, 0.6)"
                      tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <image
                            href={payload.value}
                            x={-55}
                            y={-25}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </g>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="count" position="right" fill="#000" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Question Scores by Image */}
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Question Scores by Image
                </Typography>
                {imageQuestionData && imageQuestionData.length > 0 && (
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="image-select-label">Select Image</InputLabel>
                    <Select
                      labelId="image-select-label"
                      id="image-select"
                      value={selectedImageIndex}
                      onChange={(e) => setSelectedImageIndex(Number(e.target.value))}
                      label="Select Image"
                    >
                      {imageQuestionData.map((img, index) => (
                        <MenuItem key={img.id} value={index}>
                          {`Image ${index + 1}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              {selectedImage ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      component="img"
                      src={selectedImage?.image}
                      alt="Selected image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        objectFit: 'cover',
                        mr: 2,
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Position indicates average score between -1 and 1
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Box flex={1} minHeight={450} sx={{ overflowY: 'auto' }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 4, pr: 2, pt: 2, pb: 2 }}
                    >
                      {selectedImage?.questions.map((question) => (
                        <Box
                          key={question.questionId}
                          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              width: '150px',
                              flexShrink: 0,
                              pr: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {question.question}
                          </Typography>
                          {question.avg !== null ? (
                            <Box sx={{ position: 'relative', flex: 1, height: 24, mt: 4, mb: 2 }}>
                              {/* Scale line */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: 0,
                                  right: 0,
                                  height: 2,
                                  bgcolor: 'grey.300',
                                  transform: 'translateY(-50%)',
                                }}
                              />

                              {/* Center marker */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  height: 12,
                                  width: 2,
                                  bgcolor: 'grey.400',
                                  transform: 'translate(-50%, -50%)',
                                }}
                              />

                              {/* Min marker */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: 0,
                                  height: 8,
                                  width: 2,
                                  bgcolor: 'grey.400',
                                  transform: 'translateY(-50%)',
                                }}
                              />

                              {/* Max marker */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  right: 0,
                                  height: 8,
                                  width: 2,
                                  bgcolor: 'grey.400',
                                  transform: 'translateY(-50%)',
                                }}
                              />

                              {/* Value marker */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: `${((question.avg + 1) / 2) * 100}%`,
                                  width: 3,
                                  bgcolor: '#000',
                                  transform: 'translateX(-50%)',
                                  borderRadius: '2px',
                                }}
                              />

                              {/* Value tooltip */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -30,
                                  left: `${((question.avg + 1) / 2) * 100}%`,
                                  transform: 'translateX(-50%)',
                                  bgcolor: '#000',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  zIndex: 1,
                                }}
                              >
                                {question.avg.toFixed(2)}
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No data available
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              ) : (
                <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                  <Alert severity="info" sx={{ width: '100%' }}>
                    No question score data available for images.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
