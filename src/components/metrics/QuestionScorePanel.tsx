'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

interface QuestionData {
  question: string;
  questionId: string;
  avg: number | null;
}

interface ImageQuestionData {
  id: string;
  image: string;
  count: number;
  questions: QuestionData[];
}

interface QuestionScorePanelProps {
  data: ImageQuestionData[] | null;
  isMobile?: boolean;
}

export default function QuestionScorePanel({ data, isMobile = false }: QuestionScorePanelProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 選択中の画像データ
  const selectedImage = data && data.length > 0 ? data[selectedImageIndex] || data[0] : null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        height: '100%',
      }}
    >
      <CardContent
        sx={{
          p: isMobile ? 1.5 : 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            gutterBottom={isMobile}
            fontSize={isMobile ? 15 : 16}
            fontWeight={isMobile ? 500 : 400}
          >
            Question Scores by Image
          </Typography>

          {data && data.length > 0 && (
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: { xs: 120, sm: 150 },
                mb: isMobile ? 1.5 : 0,
                mt: isMobile ? 2 : 0,
              }}
            >
              <InputLabel id={`${isMobile ? 'mobile-' : ''}image-select-label`}>
                Select Image
              </InputLabel>
              <Select
                labelId={`${isMobile ? 'mobile-' : ''}image-select-label`}
                id={`${isMobile ? 'mobile-' : ''}image-select`}
                value={selectedImageIndex}
                onChange={(e) => setSelectedImageIndex(Number(e.target.value))}
                label="Select Image"
                sx={{ fontSize: 13 }}
              >
                {data.map((img, index) => (
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: isMobile ? 0.5 : 1 }}>
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
                        {/* スケールライン */}
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

                        {/* 中央マーカー */}
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

                        {/* 最小マーカー */}
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

                        {/* 最大マーカー */}
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

                        {/* 値マーカー */}
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

                        {/* 値ツールチップ */}
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
  );
}
