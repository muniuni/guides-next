'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import useSWR, { mutate } from 'swr';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import SearchIcon from '@mui/icons-material/Search';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NotesIcon from '@mui/icons-material/Notes';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CreateProjectForm from '@/components/CreateProjectForm';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import ProjectDetailsCard from '@/components/ProjectDetailsCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MAX_DESCRIPTION_LENGTH = 45;
const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: projects, error, isLoading } = useSWR('/api/projects', fetcher);
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'info' | 'error',
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const p = searchParams;
    if (p.get('updated')) {
      setSnackbar({
        open: true,
        message: 'Project updated!',
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    } else if (p.get('login')) {
      setSnackbar({
        open: true,
        message: 'Logged in successfully',
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    } else if (p.get('signup')) {
      setSnackbar({
        open: true,
        message: 'Account created!',
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    } else if (p.get('accountUpdated')) {
      setSnackbar({
        open: true,
        message: 'Account information updated',
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSuccess = async () => {
    setOpen(false);
    await mutate('/api/projects');
    setSnackbar({ open: true, message: 'Project added!', severity: 'success' });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
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
    setLoading(true);
    const res = await fetch(`/api/projects/${pendingDeleteId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await mutate('/api/projects');
      setSnackbar({ open: true, message: 'Project deleted', severity: 'info' });
    }
    setDeleteDialogOpen(false);
    setLoading(false);
  };

  const handleDetailsClick = () => {
    const project = projects.find((p: any) => p.id === menuProjectId);
    if (project) {
      setSelectedProject({
        ...project,
        images: project.images || [],
        questions: project.questions || [],
      });
      setDetailsDialogOpen(true);
    }
    handleMenuClose();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const allCount = projects.length;
  const myCount = projects.filter((p: any) => p.userId === userId).length;
  const sorted = [...projects].sort(
    (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const tabFiltered = tabIndex === 0 ? sorted : sorted.filter((p: any) => p.userId === userId);
  const displayed = tabFiltered.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else {
      return `${minutes} minutes ago`;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" mb={2}>
        Projects
      </Typography>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${allCount})`} />
        <Tab label={`My Projects (${myCount})`} />
      </Tabs>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
        <TextField
          size="small"
          placeholder="Search projects"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mr: 2 }}
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
            sx={{ bgcolor: '#000', color: '#fff' }}
          >
            {isMobile ? 'New' : 'New Project'}
          </Button>
        )}
      </Box>
      <Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {displayed.map((project) => {
            const isOwner = project.userId === userId;
            return (
              <Box key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 2, sm: 3 },
                    maxWidth: 400,
                    margin: '0 auto',
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 120, sm: 200 },
                      width: '100%',
                      bgcolor: 'grey.200',
                      position: 'relative',
                      overflow: 'hidden',
                      borderTopLeftRadius: { xs: 2, sm: 3 },
                      borderTopRightRadius: { xs: 2, sm: 3 },
                      backgroundImage:
                        project.images && project.images.length > 0
                          ? 'none'
                          : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      '&::after': {
                        content:
                          project.images && project.images.length > 0 ? 'none' : '"No Image"',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'rgba(0, 0, 0, 0.2)',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      },
                    }}
                  >
                    {project.images && project.images.length > 0 && (
                      <Box
                        component="img"
                        src={project.images[0].url}
                        alt="Cover"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        overflowX: 'auto',
                      }}
                    >
                      <Typography variant="h6" noWrap>
                        {project.name}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <IconButton
                          component={NextLink}
                          href={`/projects/${project.id}/edit`}
                          disabled={!isOwner}
                          size="small"
                        >
                          <CreateOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          component={NextLink}
                          href={`/projects/${project.id}/metrics`}
                          size="small"
                        >
                          <AssessmentOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={(e) => handleMenuOpen(e, project.id)} size="small">
                          <MoreHorizOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ ml: 0.5 }}
                    >
                      By {project.user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {truncate(project.description, MAX_DESCRIPTION_LENGTH)}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      <CalendarTodayOutlinedIcon
                        sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }}
                      />
                      {formatDate(project.createdAt)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <ScheduleOutlinedIcon
                        sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }}
                      />
                      {timeAgo(project.updatedAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      fullWidth
                      component={MUILink}
                      href={`/projects/${project.id}`}
                      sx={{ textTransform: 'none' }}
                    >
                      Start Evaluation
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleDetailsClick}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: 'error.main' }}
          disabled={projects.find((p: any) => p.id === menuProjectId)?.userId !== userId}
        >
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this project?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            {loading ? <CircularProgress size={24} /> : 'DELETE'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2 }}>
          Create New Project
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <CreateProjectForm onSuccess={handleSuccess} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {selectedProject && (
        <ProjectDetailsCard
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          project={selectedProject}
        />
      )}
    </Box>
  );
}
