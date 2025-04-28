"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function EditProjectForm({
  initialProject,
}: EditProjectFormProps) {
  const router = useRouter();
  const {
    id,
    name,
    description,
    consentInfo,
    imageCount,
    imageDuration,
    questions,
    images,
  } = initialProject;

  const [projectName, setProjectName] = useState<string>(name);
  const [projectDesc, setProjectDesc] = useState<string>(description);
  const [consentText, setConsentText] = useState<string>(consentInfo);
  const [projectImageCount, setProjectImageCount] =
    useState<number>(imageCount);
  const [projectImageDuration, setProjectImageDuration] =
    useState<number>(imageDuration);
  const [questionList, setQuestionList] = useState<Question[]>(
    questions.length > 0
      ? questions.map((q) => ({ id: q.id, text: q.text }))
      : [{ id: null, text: "" }],
  );
  const [existingImages, setExistingImages] = useState<ImageRecord[]>(images);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerVisible, setFooterVisible] = useState<boolean>(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  const addQuestion = () => {
    setQuestionList((prev) => [...prev, { id: null, text: "" }]);
  };
  const removeQuestion = (index: number) => {
    setQuestionList((prev) => prev.filter((_, i) => i !== index));
  };
  const updateQuestion = (index: number, text: string) => {
    setQuestionList((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text } : q)),
    );
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setNewFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };
  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDesc);
    formData.append("consentInfo", consentText);
    formData.append("imageCount", projectImageCount.toString());
    formData.append("imageDuration", projectImageDuration.toString());
    formData.append("questions", JSON.stringify(questionList));
    formData.append(
      "existingImageIds",
      JSON.stringify(existingImages.map((img) => img.id)),
    );
    newFiles.forEach((file) => formData.append("newImages", file));

    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      body: formData,
    });
    router.push("/?updated=true");
  };
  const handleDiscard = () => router.back();

  return (
    <>
      <Box
        component="form"
        id="edit-project-form"
        onSubmit={handleSubmit}
        noValidate
        encType="multipart/form-data"
        sx={{ p: 3, maxWidth: 600, mx: "auto" }}
      >
        <Typography variant="h4" mb={2}>
          Edit Project
        </Typography>
        <Typography variant="h6" mb={2}>
          General
        </Typography>
        <Stack spacing={2}>
          {/* General Fields */}
          <TextField
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Consent Info"
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            label="Images to Display"
            type="number"
            value={projectImageCount}
            onChange={(e) => setProjectImageCount(Number(e.target.value) || 0)}
            fullWidth
          />
          <TextField
            label="Image Display Duration (s)"
            type="number"
            value={projectImageDuration}
            onChange={(e) =>
              setProjectImageDuration(Number(e.target.value) || 0)
            }
            fullWidth
          />

          {/* Questions Section */}
          <Box>
            <Typography variant="h6" mb={2}>
              Questions
            </Typography>
            {questionList.map((q, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                mt={1}
              >
                <TextField
                  label={`Question ${i + 1}`}
                  value={q.text}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => removeQuestion(i)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ mt: 1 }}
            >
              Add Question
            </Button>
          </Box>

          {/* Images Section */}
          <Box>
            <Typography variant="h6" mb={2}>
              Images
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              mt={1}
            >
              {existingImages.map((img, i) => (
                <Box key={img.id} position="relative">
                  <img
                    src={img.url}
                    alt="Existing"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeExistingImage(i)}
                    sx={{ position: "absolute", top: 0, right: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {newFiles.map((file, i) => (
                <Box key={i} position="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="New"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeNewFile(i)}
                    sx={{ position: "absolute", top: 0, right: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button startIcon={<AddIcon />} component="label" sx={{ mt: 1 }}>
              Upload Images
              <input
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {/* Form Actions */}
          <Stack
            direction="row"
            spacing={2}
            mt={1}
            width="100%"
            ref={footerRef}
          >
            <Button
              variant="outlined"
              onClick={handleDiscard}
              sx={{ flex: "2 1 10%" }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ flex: "8 1 10%" }}>
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Box>
      {!footerVisible && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          display="flex"
          justifyContent="center"
          zIndex={1300}
        >
          <Stack
            direction="row"
            spacing={2}
            width="100%"
            maxWidth={600}
            px={3}
            pt={2}
            pb={2}
            bgcolor="rgba(255,255,255,0.8)"
          >
            <Button
              variant="outlined"
              onClick={handleDiscard}
              sx={{ flex: "2 1 10%" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-project-form"
              variant="contained"
              sx={{ flex: "8 1 10%" }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
