import React from 'react';
import { Box, TextField, Typography, Stack, Card, CardContent, CardHeader } from '@mui/material';
import { GeneralInformationCardProps } from './types';
import {
  CARD_STYLES,
  CARD_HEADER_STYLES,
  CARD_CONTENT_STYLES,
  INPUT_HEIGHT_STYLES,
} from './styles';

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
  return (
    <Card sx={CARD_STYLES}>
      <CardHeader
        title="General Information"
        titleTypographyProps={{ variant: 'h6' }}
        sx={CARD_HEADER_STYLES}
      />
      <CardContent sx={CARD_CONTENT_STYLES}>
        <Stack spacing={3}>
          <TextField
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            size="small"
            sx={INPUT_HEIGHT_STYLES}
          />
          <TextField
            label="Description"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            multiline
            rows={5}
            fullWidth
            size="small"
          />
          <TextField
            label="Consent Info"
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            multiline
            rows={4}
            fullWidth
            size="small"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                label="Images to Display"
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
                  The number of images to display ({imageCountInfo.value}) exceeds the total number
                  of available images ({totalImages})
                </Typography>
              )}
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                label="Image Display Duration (s)"
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
