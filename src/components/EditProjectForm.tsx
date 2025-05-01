'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// 型定義
interface Question {
  id: string | null;
  text: string;
}
interface ImageRecord {
  id: string;
  url: string;
}
interface Project {
  id: string;
  name: string;
  description: string;
  consentInfo: string;
  imageCount: number;
  imageDuration: number;
  questions: Question[];
  images: ImageRecord[];
}
interface EditProjectFormProps {
  initialProject: Project;
}

export default function EditProjectForm({ initialProject }: EditProjectFormProps) {
  const router = useRouter();
  const { id, name, description, consentInfo, imageCount, imageDuration, questions, images } =
    initialProject;

  const [projectName, setProjectName] = useState<string>(name);
  const [projectDesc, setProjectDesc] = useState<string>(description);
  const [consentText, setConsentText] = useState<string>(consentInfo);
  const [projectImageCount, setProjectImageCount] = useState<string>(imageCount.toString());
  const [projectImageDuration, setProjectImageDuration] = useState<string>(
    imageDuration.toString()
  );
  const [questionList, setQuestionList] = useState<Question[]>(
    questions.length > 0
      ? questions.map((q) => ({ id: q.id, text: q.text }))
      : [{ id: null, text: '' }]
  );
  const [existingImages, setExistingImages] = useState<ImageRecord[]>(images);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerVisible, setFooterVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const totalImages = existingImages.length + newFiles.length - imagesToDelete.size;
  const isImageCountValid = parseInt(projectImageCount) <= totalImages;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0,
    });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  const addQuestion = () => {
    setQuestionList((prev) => [...prev, { id: null, text: '' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestionList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, text: string) => {
    setQuestionList((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setNewFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    setImagesToDelete((prev) => {
      const newSet = new Set(prev);
      selectedImages.forEach((id) => newSet.add(id));
      return newSet;
    });
    setExistingImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
    setDeleteDialogOpen(false);
    setIsSelectMode(false);
  };

  const removeExistingImage = async (idx: number) => {
    const img = existingImages[idx];
    try {
      await fetch(`/api/projects/${id}/images/${img.id}`, { method: 'DELETE' });
      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    } catch (error) {
      console.error('Failed to delete image', error);
    }
  };

  const removeNewFile = (idx: number) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 空の質問をフィルタリング
      const filteredQuestions = questionList.filter((q) => q.text.trim() !== '');

      const formData = new FormData();
      formData.append('name', projectName);
      formData.append('description', projectDesc);
      formData.append('consentInfo', consentText);
      formData.append('imageCount', projectImageCount);
      formData.append('imageDuration', projectImageDuration);
      formData.append('questions', JSON.stringify(filteredQuestions));
      formData.append('imagesToDelete', JSON.stringify(Array.from(imagesToDelete)));
      formData.append('existingImageIds', JSON.stringify(existingImages.map((img) => img.id)));
      newFiles.forEach((file) => formData.append('newImages', file));

      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to update project');
      }

      router.push('/?updated=true');
    } catch (error) {
      console.error('Error updating project:', error);
      // エラーハンドリングを追加する場合はここに
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges()) {
      setCancelDialogOpen(true);
    } else {
      router.back();
    }
  };

  const handleConfirmDiscard = () => {
    setCancelDialogOpen(false);
    router.back();
  };

  const handleImageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectImageCount(value);
    if (value === '') {
      setProjectImageCount('');
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setProjectImageCount(num.toString());
      }
    }
  };

  const handleImageCountBlur = () => {
    if (projectImageCount === '') {
      setProjectImageCount('0');
    }
  };

  const handleImageDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectImageDuration(value);
    if (value === '') {
      setProjectImageDuration('');
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setProjectImageDuration(num.toString());
      }
    }
  };

  const handleImageDurationBlur = () => {
    if (projectImageDuration === '') {
      setProjectImageDuration('0');
    }
  };

  // 変更点の検知
  const hasChanges = () => {
    // 基本情報の変更チェック
    const basicInfoChanged =
      projectName !== name ||
      projectDesc !== description ||
      consentText !== consentInfo ||
      projectImageCount !== imageCount.toString() ||
      projectImageDuration !== imageDuration.toString();

    // 質問リストの変更チェック
    const questionsChanged = () => {
      if (questions.length !== questionList.length) return true;
      return questions.some((q, i) => {
        const currentQ = questionList[i];
        return q.text !== currentQ.text;
      });
    };

    // 画像の変更チェック
    const imagesChanged = () => {
      return (
        newFiles.length > 0 || // 新規アップロード
        imagesToDelete.size > 0 || // 削除予定の画像
        existingImages.length !== images.length // 既存画像の削除
      );
    };

    return basicInfoChanged || questionsChanged() || imagesChanged();
  };

  const handleSelectModeToggle = () => {
    setIsSelectMode(true);
    setSelectedImages(new Set());
  };

  return (
    <>
      <Box
        component="form"
        id="edit-project-form"
        onSubmit={handleSubmit}
        noValidate
        encType="multipart/form-data"
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 800,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Typography variant="h4" mb={{ xs: 3, sm: 4 }}>
          Edit Project
        </Typography>

        <Stack spacing={{ xs: 3, sm: 4 }}>
          {/* General Information Card */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title="General Information"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ pb: 1, px: { xs: 2, sm: 3 } }}
            />
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <TextField
                  label="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiInputBase-root': { height: { xs: 48, sm: 40 } } }}
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
                      value={projectImageCount}
                      onChange={handleImageCountChange}
                      onBlur={handleImageCountBlur}
                      fullWidth
                      size="small"
                      error={!isImageCountValid}
                      sx={{ '& .MuiInputBase-root': { height: { xs: 48, sm: 40 } } }}
                    />
                    {!isImageCountValid && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        The number of images to display ({projectImageCount}) exceeds the total
                        number of available images ({totalImages})
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <TextField
                      label="Image Display Duration (s)"
                      type="number"
                      value={projectImageDuration}
                      onChange={handleImageDurationChange}
                      onBlur={handleImageDurationBlur}
                      fullWidth
                      size="small"
                      sx={{ '& .MuiInputBase-root': { height: { xs: 48, sm: 40 } } }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title="Questions"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Button
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                  size="small"
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    px: { xs: 1, sm: 2 },
                    mt: 0.5,
                  }}
                >
                  Add Question
                </Button>
              }
              sx={{ pb: 1, px: { xs: 2, sm: 3 } }}
            />
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                {questionList.map((q, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label={`Question ${i + 1}`}
                      value={q.text}
                      onChange={(e) => updateQuestion(i, e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ '& .MuiInputBase-root': { height: { xs: 48, sm: 40 } } }}
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

          {/* Images Card */}
          <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title="Images"
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
                          borderRadius: 2,
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
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        Delete Selected
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsSelectMode(false);
                          setSelectedImages(new Set());
                        }}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => setIsSelectMode(true)}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        Select
                      </Button>
                      <Button
                        startIcon={<AddIcon />}
                        component="label"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        Upload Images
                        <input
                          type="file"
                          multiple
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Button>
                    </>
                  )}
                </Stack>
              }
              sx={{ pb: 1, px: { xs: 2, sm: 3 } }}
            />
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
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
                  {existingImages.map((img, i) => (
                    <Paper
                      key={img.id}
                      elevation={0}
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: isSelectMode ? 'pointer' : 'default',
                      }}
                      onClick={() => isSelectMode && handleImageSelect(img.id)}
                    >
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedImages.has(img.id)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            borderRadius: '50%',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                            },
                          }}
                        />
                      )}
                      <img
                        src={img.url}
                        alt="Existing"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                        }}
                      />
                    </Paper>
                  ))}
                  {newFiles.map((file, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeNewFile(i)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box
            ref={footerRef}
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              mt: 2,
              transition: 'transform 0.2s ease-in-out',
              transform: footerVisible ? 'translateY(0)' : 'translateY(-100%)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255,255,255,0.8)',
                borderTop: '1px solid',
                borderColor: 'divider',
                py: 2,
              }}
            >
              <Stack direction="row" spacing={2} width="100%" maxWidth={800} px={{ xs: 2, sm: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleDiscard}
                  sx={{
                    flex: 1,
                    height: { xs: 48, sm: 40 },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    flex: 2,
                    height: { xs: 48, sm: 40 },
                  }}
                  disabled={loading || !hasChanges()}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          You have unsaved changes. Are you sure you want to discard them?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Editing</Button>
          <Button onClick={handleConfirmDiscard} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedImages.size} selected image
          {selectedImages.size !== 1 ? 's' : ''}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelected} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
