import React from 'react';
import { TextField, Button, IconButton, Stack, Card, CardContent, CardHeader } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from 'next-intl';
import { QuestionsCardProps } from './types';
import {
  CARD_STYLES,
  CARD_HEADER_STYLES,
  CARD_CONTENT_STYLES,
  BUTTON_STYLES,
  INPUT_HEIGHT_STYLES,
} from './styles';

export function QuestionsCard({
  questionList,
  addQuestion,
  updateQuestion,
  removeQuestion,
}: QuestionsCardProps) {
  const t = useTranslations('projects.edit');
  return (
    <Card sx={CARD_STYLES}>
      <CardHeader
        title={t('questions')}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={addQuestion}
            size="small"
            sx={{
              ...BUTTON_STYLES,
              mt: 0.5,
            }}
          >
            {t('addQuestion')}
          </Button>
        }
        sx={CARD_HEADER_STYLES}
      />
      <CardContent sx={CARD_CONTENT_STYLES}>
        <Stack spacing={2}>
          {questionList.map((q, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                label={`質問 ${i + 1}`}
                value={q.text}
                onChange={(e) => updateQuestion(i, e.target.value)}
                fullWidth
                size="small"
                sx={INPUT_HEIGHT_STYLES}
              />
              <IconButton
                onClick={() => removeQuestion(i)}
                size="small"
                sx={{
                  minWidth: { xs: 48, sm: 40 },
                  height: { xs: 48, sm: 40 },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
