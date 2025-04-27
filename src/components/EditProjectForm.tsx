"use client";
import { useState, useRef, useEffect } from "react";
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

export default function EditProjectForm({ initialProject }) {
  const router = useRouter();
  const { id, name, description, consentInfo, imageCount, questions, images } =
    initialProject;

  const [projectName, setProjectName] = useState(name);
  const [projectDesc, setProjectDesc] = useState(description);
  const [consentText, setConsentText] = useState(consentInfo);
  const [projectImageCount, setProjectImageCount] = useState(imageCount);
  const [questionList, setQuestionList] = useState(
    questions.length
      ? questions.map((q) => ({ id: q.id, text: q.text }))
      : [{ id: null, text: "" }],
  );

  const [existingImages, setExistingImages] = useState(images);
  const [newFiles, setNewFiles] = useState([]);

  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { root: null, threshold: 0 },
    );
    const el = footerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const addQuestion = () =>
    setQuestionList((prev) => [...prev, { id: null, text: "" }]);
  const removeQuestion = (index) =>
    setQuestionList((prev) => prev.filter((_, i) => i !== index));
  const updateQuestion = (index, text) =>
    setQuestionList((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text } : q)),
    );

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const removeExistingImage = (idx) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  const removeNewFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDesc);
    formData.append("consentInfo", consentText);
    formData.append("imageCount", String(projectImageCount));
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

  const handleDiscard = () => {
    router.back();
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        encType="multipart/form-data"
        sx={{ p: 3, maxWidth: 600, mx: "auto" }}
      >
        <Typography variant="h4" mb={2}>
          Edit Project
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          General
        </Typography>
        <Stack spacing={2}>
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
            onChange={(e) =>
              setProjectImageCount(parseInt(e.target.value, 10) || 0)
            }
            fullWidth
          />

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Questions
            </Typography>
            {questionList.map((q, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1 }}
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

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Images
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexWrap: "wrap", mt: 1 }}
            >
              {existingImages.map((img, i) => (
                <Box key={img.id} sx={{ position: "relative" }}>
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
                <Box key={i} sx={{ position: "relative" }}>
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

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 1, width: "100%" }}
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
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1300,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: "100%",
              maxWidth: 600,
              px: 3,
              pt: 2,
              pb: 2,
              bgcolor: "rgba(255,255,255,0.8)",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleDiscard}
              sx={{ flex: "2 1 10%" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit({ preventDefault: () => {} })}
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
