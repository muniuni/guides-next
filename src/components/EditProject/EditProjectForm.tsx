'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import { EditProjectFormProps, Question, ImageRecord } from './types';
import { useNumberField, useImageSelection } from './hooks';
import { GeneralInformationCard } from './GeneralInformationCard';
import { QuestionsCard } from './QuestionsCard';
import { ImagesCard } from './ImagesCard';
import { DeleteImagesDialog, DiscardChangesDialog } from './Dialogs';
import { formatDateForInput, parseInputDate } from '@/lib/duration-utils';

export default function EditProjectForm({ initialProject }: EditProjectFormProps) {
  const t = useTranslations('projects.edit');
  const router = useRouter();
  const { id, name, description, consentInfo, imageCount, imageDuration, questions, images, startDate, endDate } =
    initialProject;

  // 基本情報ステート
  const [projectName, setProjectName] = useState<string>(name);
  const [projectDesc, setProjectDesc] = useState<string>(description);
  const [consentText, setConsentText] = useState<string>(consentInfo);

  // 実施期間ステート
  const [projectStartDate, setProjectStartDate] = useState<string>(formatDateForInput(startDate));
  const [projectEndDate, setProjectEndDate] = useState<string>(formatDateForInput(endDate));
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState<boolean>(
    initialProject.allowMultipleAnswers ?? true
  );

  // カスタムフックでの数値入力管理
  const imageCountInfo = useNumberField(imageCount);
  const imageDurationInfo = useNumberField(imageDuration);

  // 質問管理
  const [questionList, setQuestionList] = useState<Question[]>(
    questions.length > 0
      ? questions.map((q) => ({ id: q.id, text: q.text }))
      : [{ id: null, text: '' }]
  );

  // 画像管理
  const [existingImages, setExistingImages] = useState<ImageRecord[]>(images);
  const [uploadingFiles, setUploadingFiles] = useState<
    { file: File; progress: number; id: string }[]
  >([]);
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());

  // 画像選択機能
  const {
    selectedImages,
    isSelectMode,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleImageSelect,
    handleSelectModeToggle,
    exitSelectMode,
  } = useImageSelection();

  // UI状態
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerVisible, setFooterVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // 計算値
  const totalImages = existingImages.length + uploadingFiles.length - imagesToDelete.size;
  const isImageCountValid = parseInt(imageCountInfo.value) <= totalImages;

  // フッターの表示管理
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0,
    });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  // 質問操作関数
  const addQuestion = () => {
    setQuestionList((prev) => [...prev, { id: null, text: '' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestionList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, text: string) => {
    setQuestionList((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  };

  const reorderQuestions = (oldIndex: number, newIndex: number) => {
    setQuestionList((prev) => {
      const result = [...prev];
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  // 画像操作関数
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // 一時的なIDを生成
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        // アップロード中のファイルを追加
        setUploadingFiles((prev) => [...prev, { file, progress: 0, id: tempId }]);

        // 署名付きURLを取得
        const response = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!response.ok) throw new Error('Failed to get upload URL');
        const { uploadUrl, fileUrl } = await response.json();

        // S3に直接アップロード
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // アップロード成功後、既存画像リストに追加（URLが空文字でないことを確認）
        if (fileUrl && fileUrl.trim() !== '') {
          setExistingImages((prev) => [...prev, { id: tempId, url: fileUrl }]);
        } else {
          console.error('Empty URL received for uploaded file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        // アップロード中のファイルを削除
        setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
      }
    }
  };

  const handleDeleteSelected = () => {
    setImagesToDelete((prev) => {
      const newSet = new Set(prev);
      selectedImages.forEach((id) => newSet.add(id));
      return newSet;
    });
    setExistingImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));
    exitSelectMode();
    setDeleteDialogOpen(false);
  };

  // フォーム送信
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
      formData.append('imageCount', imageCountInfo.value);
      formData.append('imageDuration', imageDurationInfo.value);
      formData.append('questions', JSON.stringify(filteredQuestions));
      formData.append('imagesToDelete', JSON.stringify(Array.from(imagesToDelete)));
      formData.append('existingImageIds', JSON.stringify(existingImages.map((img) => img.id)));
      formData.append('startDate', parseInputDate(projectStartDate) || '');
      formData.append('endDate', parseInputDate(projectEndDate) || '');
      formData.append('allowMultipleAnswers', String(allowMultipleAnswers));

      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to update project');
      }

      // 新規画像の登録
      const newImageUrls = existingImages
        .filter((img) => img.id.startsWith('temp-'))
        .map((img) => img.url)
        .filter((url) => url !== null && url !== '');

      for (const url of newImageUrls) {
        await fetch(`/api/projects/${id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, projectId: id }),
        });
      }

      router.push('/?updated=true');
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  // キャンセル処理
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

  // 変更検知
  const hasChanges = () => {
    // 基本情報の変更チェック
    const basicInfoChanged =
      projectName !== name ||
      projectDesc !== description ||
      consentText !== consentInfo ||
      imageCountInfo.value !== imageCount.toString() ||
      imageDurationInfo.value !== imageDuration.toString() ||
      projectStartDate !== formatDateForInput(startDate) ||
      projectEndDate !== formatDateForInput(endDate) ||
      allowMultipleAnswers !== (initialProject.allowMultipleAnswers ?? true);

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
        uploadingFiles.length > 0 || // 新規アップロード
        imagesToDelete.size > 0 || // 削除予定の画像
        existingImages.length !== images.length // 既存画像の削除
      );
    };

    return basicInfoChanged || questionsChanged() || imagesChanged();
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
          {t('title')}
        </Typography>

        <Stack spacing={{ xs: 3, sm: 4 }}>
          {/* General Information Card */}
          <GeneralInformationCard
            projectName={projectName}
            setProjectName={setProjectName}
            projectDesc={projectDesc}
            setProjectDesc={setProjectDesc}
            consentText={consentText}
            setConsentText={setConsentText}
            imageCountInfo={imageCountInfo}
            imageDurationInfo={imageDurationInfo}
            isImageCountValid={isImageCountValid}
            totalImages={totalImages}
            startDate={projectStartDate}
            setStartDate={setProjectStartDate}
            endDate={projectEndDate}
            setEndDate={setProjectEndDate}
            allowMultipleAnswers={allowMultipleAnswers}
            setAllowMultipleAnswers={setAllowMultipleAnswers}
          />

          {/* Questions Card */}
          <QuestionsCard
            questionList={questionList}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            reorderQuestions={reorderQuestions}
          />

          {/* Images Card */}
          <ImagesCard
            existingImages={existingImages}
            uploadingFiles={uploadingFiles}
            isSelectMode={isSelectMode}
            selectedImages={selectedImages}
            handleImageSelect={handleImageSelect}
            handleSelectModeToggle={handleSelectModeToggle}
            exitSelectMode={exitSelectMode}
            setDeleteDialogOpen={setDeleteDialogOpen}
            handleFileChange={handleFileChange}
          />

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
                  {t('cancel')}
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
                  {loading ? <CircularProgress size={24} /> : t('saveChanges')}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <DiscardChangesDialog
        open={cancelDialogOpen}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setCancelDialogOpen(false)}
      />

      {/* Delete Images Dialog */}
      <DeleteImagesDialog
        open={deleteDialogOpen}
        count={selectedImages.size}
        loading={loading}
        onConfirm={handleDeleteSelected}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
