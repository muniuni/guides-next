import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  CardHeader,
  FormHelperText,
  Button,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { GeneralInformationCardProps } from './types';
import {
  CARD_STYLES,
  CARD_HEADER_STYLES,
  CARD_CONTENT_STYLES,
  INPUT_HEIGHT_STYLES,
} from './styles';
import dynamic from 'next/dynamic';

// Dynamically import the MarkdownContent component
const MarkdownContent = dynamic(() => import('../MarkdownContent'), { ssr: false });

export function GeneralInformationCard({
  projectName,
  setProjectName,
  projectDesc,
  setProjectDesc,
  consentText,
  setConsentText,
  imageCountInfo,
  imageDurationInfo,
  isImageCountValid,
  totalImages,
}: GeneralInformationCardProps) {
  const t = useTranslations('projects.edit');
  const [descPreview, setDescPreview] = useState(false);
  const [consentPreview, setConsentPreview] = useState(false);

  return (
    <Card sx={CARD_STYLES}>
      <CardHeader
        title={t('generalInfo')}
        titleTypographyProps={{ variant: 'h6' }}
        sx={CARD_HEADER_STYLES}
      />
      <CardContent sx={CARD_CONTENT_STYLES}>
        <Stack spacing={3}>
          <TextField
            label={t('projectName')}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            size="small"
            sx={INPUT_HEIGHT_STYLES}
          />

          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="subtitle1">{t('projectDescription')}</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={descPreview}
                    onChange={(e) => setDescPreview(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">プレビュー</Typography>}
                labelPlacement="start"
              />
            </Box>

            {!descPreview ? (
              <TextField
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                multiline
                rows={8}
                fullWidth
                size="small"
                placeholder={t('projectDescription')}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.9rem' } }}
              />
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: '200px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  bgcolor: 'background.paper',
                }}
              >
                <MarkdownContent content={projectDesc || '*内容なし*'} />
              </Paper>
            )}
          </Box>

          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="subtitle1">{t('consentInfo')}</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={consentPreview}
                    onChange={(e) => setConsentPreview(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">プレビュー</Typography>}
                labelPlacement="start"
              />
            </Box>

            {!consentPreview ? (
              <TextField
                value={consentText}
                onChange={(e) => setConsentText(e.target.value)}
                multiline
                rows={8}
                fullWidth
                size="small"
                placeholder={t('consentInfo')}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.9rem' } }}
              />
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: '200px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  bgcolor: 'background.paper',
                }}
              >
                <MarkdownContent content={consentText || '*内容なし*'} />
              </Paper>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                label={t('imageCount')}
                type="number"
                value={imageCountInfo.value}
                onChange={imageCountInfo.handleChange}
                onBlur={imageCountInfo.handleBlur}
                fullWidth
                size="small"
                error={!isImageCountValid}
                sx={INPUT_HEIGHT_STYLES}
              />
              {!isImageCountValid && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {t('imageCountError', { total: totalImages })}
                </Typography>
              )}
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                label={t('imageDuration')}
                type="number"
                value={imageDurationInfo.value}
                onChange={imageDurationInfo.handleChange}
                onBlur={imageDurationInfo.handleBlur}
                fullWidth
                size="small"
                sx={INPUT_HEIGHT_STYLES}
              />
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
