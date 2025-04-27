// src/app/page.tsx
"use client";
import { useState } from "react";
import NextLink from "next/link";
import useSWR, { mutate } from "swr";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link as MUILink,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useSession } from "next-auth/react";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import NotesIcon from "@mui/icons-material/Notes";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CreateProjectForm from "@/components/CreateProjectForm";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: projects, error, isLoading } = useSWR("/api/projects", fetcher);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSuccess = async () => {
    setOpen(false);
    await mutate("/api/projects");
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load projects</Typography>
      </Box>
    );
  }

  if (isLoading || !projects) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const allCount = projects.length;
  const myCount = projects.filter((p: any) => p.userId === userId).length;
  const sorted = [...projects].sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const tabFiltered =
    tabIndex === 0 ? sorted : sorted.filter((p: any) => p.userId === userId);
  const displayed = tabFiltered.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
  };

  const daysAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${day} days ago`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Projects
      </Typography>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${allCount})`} />
        <Tab label={`My Projects (${myCount})`} />
      </Tabs>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2, width: "100%" }}>
        <TextField
          size="small"
          placeholder="Search projects"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ bgcolor: "#000", color: "#fff" }}
        >
          Create Project
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "15%" }}>
              <FolderOpenIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Project Name
            </TableCell>
            <TableCell sx={{ width: "20%" }}>
              <NotesIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Description
            </TableCell>
            <TableCell sx={{ width: "15%" }}>
              <CalendarTodayIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Created At
            </TableCell>
            <TableCell sx={{ width: "15%" }}>Updated</TableCell>
            <TableCell sx={{ width: "20%" }}>Actions</TableCell>
            <TableCell align="right" sx={{ width: "15%" }}>
              <LaunchIcon fontSize="small" sx={{ verticalAlign: "middle" }} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayed.map((project: any) => {
            const isOwner = project.userId === userId;
            return (
              <TableRow key={project.id}>
                <TableCell sx={{ width: "15%" }}>
                  <MUILink
                    component={NextLink}
                    href={`/projects/${project.id}/edit`}
                    underline="hover"
                    sx={{ color: "inherit", cursor: "pointer" }}
                  >
                    {project.name}
                  </MUILink>
                </TableCell>
                <TableCell sx={{ width: "20%" }}>
                  {project.description}
                </TableCell>
                <TableCell sx={{ width: "15%" }}>
                  {formatDate(project.createdAt)}
                </TableCell>
                <TableCell sx={{ width: "15%" }}>
                  {daysAgo(project.updatedAt)}
                </TableCell>
                <TableCell sx={{ width: "20%" }}>
                  <IconButton
                    component={NextLink}
                    href={`/projects/${project.id}/edit`}
                    disabled={!isOwner}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    component={NextLink}
                    href={`/projects/${project.id}/metrics`}
                  >
                    <AssessmentIcon />
                  </IconButton>
                  <IconButton
                    component={NextLink}
                    href={`/projects/${project.id}/info`}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right" sx={{ width: "15%" }}>
                  <Typography
                    component={MUILink}
                    href={`/projects/${project.id}`}
                    underline="hover"
                    variant="body2"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    Start Evaluation{" "}
                    <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Create New Project
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <CreateProjectForm onSuccess={handleSuccess} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
