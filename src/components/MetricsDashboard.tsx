'use client';

import React, { useState, useEffect } from 'react';
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
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import useMediaQuery from '@mui/material/useMediaQuery';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
  projectId?: string; // Add projectId parameter
}

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

  // Mobile UI
  if (isMobile) {
    return (
      <Box sx={{ p: 2, maxWidth: 1200, margin: '0 auto' }}>
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

        {/* Summary Cards in Horizontal Scrollable Row */}
        <Box sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5, width: 'max-content', minWidth: '100%' }}>
            {/* Unique Respondents Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                minWidth: 120,
                flexGrow: 1,
              }}
            >
              <CardContent sx={{ p: 1.5, py: 1.2 }}>
                <Box display="flex" alignItems="center" sx={{ minHeight: 32 }}>
                  <Avatar
                    sx={{ bgcolor: 'grey.100', color: '#000', mr: 1.5, width: 32, height: 32 }}
                  >
                    <PeopleOutlineIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={12}
                      lineHeight={1.2}
                    >
                      Respondents
                    </Typography>
                    <Typography
                      variant="h6"
                      component="div"
                      fontWeight="medium"
                      fontSize={18}
                      lineHeight={1.3}
                    >
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                minWidth: 120,
                flexGrow: 1,
              }}
            >
              <CardContent sx={{ p: 1.5, py: 1.2 }}>
                <Box display="flex" alignItems="center" sx={{ minHeight: 32 }}>
                  <Avatar
                    sx={{ bgcolor: 'grey.100', color: '#000', mr: 1.5, width: 32, height: 32 }}
                  >
                    <BarChartIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={12}
                      lineHeight={1.2}
                    >
                      Total Scores
                    </Typography>
                    <Typography
                      variant="h6"
                      component="div"
                      fontWeight="medium"
                      fontSize={18}
                      lineHeight={1.3}
                    >
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                minWidth: 120,
                flexGrow: 1,
              }}
            >
              <CardContent sx={{ p: 1.5, py: 1.2 }}>
                <Box display="flex" alignItems="center" sx={{ minHeight: 32 }}>
                  <Avatar
                    sx={{ bgcolor: 'grey.100', color: '#000', mr: 1.5, width: 32, height: 32 }}
                  >
                    <ImageIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={12}
                      lineHeight={1.2}
                    >
                      Total Images
                    </Typography>
                    <Typography
                      variant="h6"
                      component="div"
                      fontWeight="medium"
                      fontSize={18}
                      lineHeight={1.3}
                    >
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                minWidth: 120,
                flexGrow: 1,
              }}
            >
              <CardContent sx={{ p: 1.5, py: 1.2 }}>
                <Box display="flex" alignItems="center" sx={{ minHeight: 32 }}>
                  <Avatar
                    sx={{ bgcolor: 'grey.100', color: '#000', mr: 1.5, width: 32, height: 32 }}
                  >
                    <QuizIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={12}
                      lineHeight={1.2}
                    >
                      Total Questions
                    </Typography>
                    <Typography
                      variant="h6"
                      component="div"
                      fontWeight="medium"
                      fontSize={18}
                      lineHeight={1.3}
                    >
                      {totalQuestions}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Tabs for Different Charts */}
        <TabContext value={mobileTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: 13,
                  textTransform: 'none',
                },
              }}
            >
              <Tab label="Monthly Scores" value="1" />
              <Tab label="By Image" value="2" />
              <Tab label="By Question" value="3" />
            </TabList>
          </Box>

          {/* Monthly Scores Tab */}
          <TabPanel value="1" sx={{ p: 0, pt: 1.5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="subtitle1" gutterBottom fontSize={15} fontWeight={500}>
                  Monthly Total Scores
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={12} mb={1}>
                  Last 6 months of scoring activity
                </Typography>
                <Divider sx={{ mb: { xs: 2, sm: 2 } }} />
                <Box height={{ xs: 220, sm: 320, md: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="rgba(0, 0, 0, 0.1)"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis dataKey="month" stroke="rgba(0, 0, 0, 0.6)" tick={{ fontSize: 10 }} />
                      <YAxis
                        allowDecimals={false}
                        padding={{ top: 20 }}
                        domain={[0, 'auto']}
                        tickCount={5}
                        stroke="rgba(0, 0, 0, 0.6)"
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          fontSize: 11,
                        }}
                      />
                      <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="count" position="top" fill="#000" fontSize={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Scores Per Image Tab */}
          <TabPanel value="2" sx={{ p: 0, pt: 1.5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="subtitle1" gutterBottom fontSize={15} fontWeight={500}>
                  Scores per Image
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={12} mb={1}>
                  Distribution of scores across images
                </Typography>
                <Box sx={{ display: 'flex' }}>
                  <ResponsiveContainer width="100%" height={perImageData.length * 50 + 20}>
                    <BarChart
                      layout="vertical"
                      data={perImageData}
                      margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="rgba(0, 0, 0, 0.1)"
                        horizontal={false}
                        vertical={true}
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        domain={[0, 'auto']}
                        tickCount={5}
                        stroke="rgba(0, 0, 0, 0.6)"
                        tick={{ fontSize: 10 }}
                      />
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
                              y={-20}
                              width={40}
                              height={40}
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
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" fill="#000" fontSize={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Question Scores Tab */}
          <TabPanel value="3" sx={{ p: 0, pt: 1.5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="subtitle1" gutterBottom fontSize={15} fontWeight={500}>
                  Question Scores by Image
                </Typography>

                {imageQuestionData && imageQuestionData.length > 0 ? (
                  <>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mb: 1.5 }}>
                      <InputLabel id="mobile-image-select-label">Select Image</InputLabel>
                      <Select
                        labelId="mobile-image-select-label"
                        id="mobile-image-select"
                        value={selectedImageIndex}
                        onChange={(e) => setSelectedImageIndex(Number(e.target.value))}
                        label="Select Image"
                        sx={{ fontSize: 13 }}
                      >
                        {imageQuestionData.map((img, index) => (
                          <MenuItem key={img.id} value={index}>
                            {`Image ${index + 1}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedImage && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            component="img"
                            src={selectedImage?.image}
                            alt="Selected image"
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              objectFit: 'cover',
                              mr: 1,
                              border: '1px solid',
                              borderColor: 'grey.300',
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" fontSize={12}>
                            Position indicates average score between -1 and 1
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ height: 300, overflowY: 'auto' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              pr: 1,
                              pt: 1,
                              pb: 1,
                            }}
                          >
                            {selectedImage?.questions.map((question) => (
                              <Box
                                key={question.questionId}
                                sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 0.5,
                                    fontSize: 13,
                                    fontWeight: 500,
                                  }}
                                >
                                  {question.question}
                                </Typography>
                                {question.avg !== null ? (
                                  <Box sx={{ position: 'relative', height: 18, mb: 1 }}>
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
                                        height: 10,
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
                                        height: 6,
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
                                        height: 6,
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
                                        transition: 'left 0.4s ease-in-out',
                                      }}
                                    />

                                    {/* Value tooltip */}
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -22,
                                        left: `${((question.avg + 1) / 2) * 100}%`,
                                        transform: 'translateX(-50%)',
                                        bgcolor: '#000',
                                        color: 'white',
                                        px: 0.7,
                                        py: 0.2,
                                        borderRadius: 1,
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        zIndex: 1,
                                        transition: 'left 0.4s ease-in-out',
                                      }}
                                    >
                                      {question.avg.toFixed(2)}
                                    </Box>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary" fontSize={12}>
                                    No data available
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                    <Alert severity="info" sx={{ width: '100%', fontSize: 13 }}>
                      No question score data available for images.
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
      </Box>
    );
  }

  // Desktop UI (existing code)
  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
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

      {/* Summary Cards */}
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
        {/* Unique Respondents Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2, width: 40, height: 40 }}>
                <PeopleOutlineIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontSize={13}>
                  Respondents
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium" fontSize={20}>
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
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2, width: 40, height: 40 }}>
                <BarChartIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontSize={13}>
                  Total Scores
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium" fontSize={20}>
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
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2, width: 40, height: 40 }}>
                <ImageIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontSize={13}>
                  Total Images
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium" fontSize={20}>
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
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2, width: 40, height: 40 }}>
                <QuizIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontSize={13}>
                  Total Questions
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium" fontSize={20}>
                  {totalQuestions}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Stack spacing={{ xs: 2, sm: 3 }}>
        {/* Monthly Scores */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontSize={16}>
              Monthly Total Scores
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph fontSize={13}>
              Last 6 months of scoring activity
            </Typography>
            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
            <Box height={{ xs: 220, sm: 320, md: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke="rgba(0, 0, 0, 0.1)"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis dataKey="month" stroke="rgba(0, 0, 0, 0.6)" tick={{ fontSize: 10 }} />
                  <YAxis
                    allowDecimals={false}
                    padding={{ top: 20 }}
                    domain={[0, 'auto']}
                    tickCount={5}
                    stroke="rgba(0, 0, 0, 0.6)"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#000" fontSize={10} />
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
            gap: 2,
          }}
        >
          {/* Scores Per Image */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontSize={16}>
                Scores per Image
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph fontSize={13}>
                Distribution of scores across images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ flex: 1, display: 'flex' }}>
                <ResponsiveContainer width="100%" height={perImageData.length * 60 + 20}>
                  <BarChart
                    layout="vertical"
                    data={perImageData}
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="rgba(0, 0, 0, 0.1)"
                      horizontal={false}
                      vertical={true}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      domain={[0, 'auto']}
                      tickCount={5}
                      stroke="rgba(0, 0, 0, 0.6)"
                      tick={{ fontSize: 10 }}
                    />
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
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="count" position="right" fill="#000" fontSize={12} />
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
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 1,
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Typography variant="h6" gutterBottom fontSize={16}>
                  Question Scores by Image
                </Typography>
                {imageQuestionData && imageQuestionData.length > 0 && (
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: { xs: 120, sm: 150 }, mt: { xs: 0, sm: 0 } }}
                  >
                    <InputLabel id="image-select-label">Select Image</InputLabel>
                    <Select
                      labelId="image-select-label"
                      id="image-select"
                      value={selectedImageIndex}
                      onChange={(e) => setSelectedImageIndex(Number(e.target.value))}
                      label="Select Image"
                      sx={{ fontSize: 13 }}
                    >
                      {imageQuestionData.map((img, index) => (
                        <MenuItem key={img.id} value={index} sx={{ fontSize: 13 }}>
                          {`Image ${index + 1}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              {selectedImage ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      component="img"
                      src={selectedImage?.image}
                      alt="Selected image"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        objectFit: 'cover',
                        mr: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" fontSize={12}>
                      Position indicates average score between -1 and 1
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ height: 300, overflowY: 'auto' }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pr: 1, pt: 1, pb: 1 }}
                    >
                      {selectedImage?.questions.map((question) => (
                        <Box
                          key={question.questionId}
                          sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 0.5,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {question.question}
                          </Typography>
                          {question.avg !== null ? (
                            <Box sx={{ position: 'relative', height: 18, mb: 1 }}>
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
                                  height: 10,
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
                                  height: 6,
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
                                  height: 6,
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
                                  transition: 'left 0.4s ease-in-out',
                                }}
                              />

                              {/* Value tooltip */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -22,
                                  left: `${((question.avg + 1) / 2) * 100}%`,
                                  transform: 'translateX(-50%)',
                                  bgcolor: '#000',
                                  color: 'white',
                                  px: 0.7,
                                  py: 0.2,
                                  borderRadius: 1,
                                  fontSize: 11,
                                  fontWeight: 'bold',
                                  zIndex: 1,
                                  transition: 'left 0.4s ease-in-out',
                                }}
                              >
                                {question.avg.toFixed(2)}
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontSize={12}>
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
                  <Alert severity="info" sx={{ width: '100%', fontSize: 13 }}>
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
