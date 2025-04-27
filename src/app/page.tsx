"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  DialogActions,
} from "@mui/material";
import { useSession } from "next-auth/react";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import NotesIcon from "@mui/icons-material/Notes";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [undoProject, setUndoProject] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "info" | "error",
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("updated")) {
      setSnackbar({
        open: true,
        message: "Project updated!",
        severity: "success",
      });
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSuccess = async () => {
    setOpen(false);
    await mutate("/api/projects");
    setSnackbar({
      open: true,
      message: "Project added!",
      severity: "success",
    });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    projectId: string,
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuProjectId(projectId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProjectId(null);
  };

  const handleDeleteClick = () => {
    setPendingDeleteId(menuProjectId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    const deletedProject = projects.find((p) => p.id === pendingDeleteId);
    const res = await fetch(`/api/projects/${pendingDeleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await mutate("/api/projects");
      setUndoProject(deletedProject);
      setSnackbar({
        open: true,
        message: "Project deleted",
        severity: "info",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleUndo = async () => {
    if (!undoProject) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(undoProject),
    });
    if (res.ok) {
      await mutate("/api/projects");
      setSnackbar({
        open: true,
        message: "Deletion undone",
        severity: "success",
      });
    }
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

  const handleSnackbarClose = () => {
    setSnackbar((s) => ({ ...s, open: false }));
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
        {session?.user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ bgcolor: "#000", color: "#fff" }}
          >
            New Project
          </Button>
        )}
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
              Created
            </TableCell>
            <TableCell sx={{ width: "15%" }}>
              <UpdateOutlinedIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Updated
            </TableCell>
            <TableCell sx={{ width: "20%" }}>
              <AutoAwesomeOutlinedIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Actions
            </TableCell>
            <TableCell align="right" sx={{ width: "15%" }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {displayed.map((project: any) => {
            const isOwner = project.userId === userId;
            return (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell>{daysAgo(project.updatedAt)}</TableCell>
                <TableCell>
                  <IconButton
                    component={NextLink}
                    href={`/projects/${project.id}/edit`}
                    sx={{ visibility: isOwner ? "visible" : "hidden" }}
                  >
                    <CreateOutlinedIcon />
                  </IconButton>
                  <IconButton
                    component={NextLink}
                    href={`/projects/${project.id}/metrics`}
                  >
                    <AssessmentOutlinedIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleMenuOpen(e, project.id)}>
                    <MoreHorizOutlinedIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
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
                    Start Evaluation
                    <ArrowOutwardOutlinedIcon
                      fontSize="small"
                      sx={{ ml: 0.5 }}
                    />
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          component={NextLink}
          href={`/projects/${menuProjectId}/info`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detail</ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={handleDeleteClick}
          disabled={
            projects.find((p: any) => p.id === menuProjectId)?.userId !== userId
          }
        >
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon
              fontSize="small"
              sx={{ color: "error.main" }}
            />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this project?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            snackbar.severity === "info" ? (
              <Button color="inherit" size="small" onClick={handleUndo}>
                Undo
              </Button>
            ) : null
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
