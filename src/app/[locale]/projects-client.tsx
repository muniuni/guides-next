'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import { Box, Tabs, Tab } from '@mui/material';
import { useSession } from 'next-auth/react';
import ProjectList from '@/components/ProjectList';
import ProjectSearchBar from '@/components/ProjectSearchBar';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import ProjectContextMenu from '@/components/ProjectContextMenu';
import NotificationSnackbar from '@/components/NotificationSnackbar';

import { Project } from '@/types/project';

interface ProjectsClientProps {
  initialProjects: Project[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const t = useTranslations('projects');
  const { data: session } = useSession();
  const userId = session?.user?.id || null;
  const [projects, setProjects] = useState(initialProjects);

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'info' | 'error',
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // プロジェクトリストの再取得関数
  const refreshProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  }, []);

  // ページがマウントされるたびにプロジェクトを再取得
  useEffect(() => {
    // ブラウザの戻るボタンで遷移した場合やページがマウントされた場合にプロジェクトを再取得
    refreshProjects();

    // popstate イベントリスナーを追加して戻るボタンを検出
    const handlePopState = () => {
      refreshProjects();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [refreshProjects]);

  // Check URL params for notifications
  useEffect(() => {
    const p = searchParams;
    if (p.get('updated')) {
      setSnackbar({
        open: true,
        message: 'Project updated!',
        severity: 'success',
      });
      router.replace('/', { scroll: false });
      refreshProjects(); // プロジェクト更新後にデータを再取得
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
  }, [searchParams, router, refreshProjects]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuProjectId(projectId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProjectId(null);
  };

  // プロジェクト削除成功時のハンドラー
  const handleDeleteSuccess = useCallback((deletedId: string) => {
    // ローカルの状態からプロジェクトを削除
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== deletedId));

    setSnackbar({
      open: true,
      message: 'Project deleted successfully',
      severity: 'success',
    });
  }, []);

  // Create project handlers
  const handleCreateClick = () => setCreateDialogOpen(true);

  const handleCreateClose = () => setCreateDialogOpen(false);

  const handleCreateSuccess = async () => {
    setCreateDialogOpen(false);
    try {
      await refreshProjects();
      setSnackbar({
        open: true,
        message: 'Project added!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  };

  // Counts for tabs
  const allCount = projects.length;
  const myCount = projects.filter((p) => p.userId === userId).length;

  return (
    <>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${allCount})`} />
        <Tab label={`${t('myProjects')} (${myCount})`} />
      </Tabs>

      <ProjectSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={handleCreateClick}
      />

      <Box>
        <ProjectList
          projects={projects}
          tabIndex={tabIndex}
          searchTerm={searchTerm}
          onMenuOpen={handleMenuOpen}
        />
      </Box>

      <ProjectContextMenu
        projects={projects}
        anchorEl={menuAnchor}
        menuProjectId={menuProjectId}
        userId={userId}
        onClose={handleMenuClose}
        onDeleteSuccess={handleDeleteSuccess}
      />

      <CreateProjectDialog
        open={createDialogOpen}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
      />

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
