import React from 'react';
import { Box, Button, Stack, Card, CardContent, CardHeader } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslations } from 'next-intl';
import { ImagesCardProps } from './types';
import { CARD_STYLES, CARD_HEADER_STYLES, CARD_CONTENT_STYLES, BUTTON_STYLES } from './styles';
import { ExistingImageItem, NewImageItem } from './ImageItems';

export function ImagesCard({
  existingImages,
  uploadingFiles,
  isSelectMode,
  selectedImages,
  handleImageSelect,
  handleSelectModeToggle,
  exitSelectMode,
  setDeleteDialogOpen,
  handleFileChange,
}: ImagesCardProps) {
  const t = useTranslations('projects.edit');
  return (
    <Card sx={CARD_STYLES}>
      <CardHeader
        title={t('images')}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            {isSelectMode ? (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={selectedImages.size === 0}
                  size="small"
                  startIcon={
                    <DeleteOutlineIcon
                      sx={{
                        color: selectedImages.size === 0 ? 'action.disabled' : 'error.main',
                      }}
                    />
                  }
                  sx={{
                    ...BUTTON_STYLES,
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.main',
                      backgroundColor: 'error.lighter',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'action.disabled',
                      color: 'action.disabled',
                    },
                  }}
                >
                  {t('deleteSelected')}
                </Button>
                <Button variant="outlined" onClick={exitSelectMode} size="small" sx={BUTTON_STYLES}>
                  {t('cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleSelectModeToggle}
                  size="small"
                  sx={BUTTON_STYLES}
                >
                  {t('selectMode')}
                </Button>
                <Button startIcon={<AddIcon />} component="label" size="small" sx={BUTTON_STYLES}>
                  {t('uploadImages')}
                  <input type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                </Button>
              </>
            )}
          </Stack>
        }
        sx={CARD_HEADER_STYLES}
      />
      <CardContent sx={CARD_CONTENT_STYLES}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {existingImages.map((img) => (
              <ExistingImageItem
                key={img.id}
                image={img}
                isSelectMode={isSelectMode}
                isSelected={selectedImages.has(img.id)}
                onSelect={handleImageSelect}
              />
            ))}
            {uploadingFiles.map(({ file, progress }, i) => (
              <NewImageItem key={i} file={file} progress={progress} index={i} onRemove={() => {}} />
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
