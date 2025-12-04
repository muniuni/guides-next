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
import ModernAlert from '@/components/ModernAlert';

import { Project } from '@/types/project';

interface ProjectsClientProps {
  initialMyProjects: Project[];
  initialFavoriteProjects: Project[];
}

export default function ProjectsClient({ initialMyProjects, initialFavoriteProjects }: ProjectsClientProps) {
  const t = useTranslations('projects');
  const tNotifications = useTranslations('notifications');
  const { data: session } = useSession();
  const userId = session?.user?.id || null;

  const [myProjects, setMyProjects] = useState(initialMyProjects);
  const [favoriteProjects, setFavoriteProjects] = useState(initialFavoriteProjects);

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
    severity: 'success' as 'success' | 'info' | 'error' | 'warning',
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // プロジェクトリストの再取得関数
  const refreshProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setMyProjects(data.myProjects);
        setFavoriteProjects(data.favoriteProjects);
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
        message: tNotifications('projectUpdated'),
        severity: 'success',
      });
      router.replace('/', { scroll: false });
      refreshProjects(); // プロジェクト更新後にデータを再取得
    } else if (p.get('login')) {
      setSnackbar({
        open: true,
        message: tNotifications('loginSuccess'),
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    } else if (p.get('signup')) {
      setSnackbar({
        open: true,
        message: tNotifications('accountCreated'),
        severity: 'success',
      });
      router.replace('/', { scroll: false });
    } else if (p.get('accountUpdated')) {
      setSnackbar({
        open: true,
        message: tNotifications('accountUpdated'),
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
    setMyProjects((current) => current.filter((p: Project) => p.id !== deletedId));
    setFavoriteProjects((current) => current.filter((p: Project) => p.id !== deletedId));

    setSnackbar({
      open: true,
      message: tNotifications('projectDeleted'),
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
        message: tNotifications('projectCreated'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  };

  // Favorite handler
  const handleToggleFavorite = async (projectId: string) => {
    // Optimistic update
    const isFavorited = favoriteProjects.some((p) => p.id === projectId);

    if (isFavorited) {
      // Remove from favorites
      setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId));
    } else {
      // Add to favorites (we need the project object)
      const projectToAdd = myProjects.find((p) => p.id === projectId);
      // If not in myProjects, it might be a project we just removed from favorites but still visible in "All" (if we had "All")
      // But here we only have "My Projects" and "Favorites".
      // If I am in "My Projects", I can add to favorites.
      // If I am in "Favorites", I can remove.
      // If I am in "My Projects" and I click favorite, it adds to "Favorites".
      if (projectToAdd) {
        setFavoriteProjects((prev) => [projectToAdd, ...prev]);
      }
    }

    try {
      const { toggleFavorite } = await import('@/app/actions/favorites');
      await toggleFavorite(projectId);
      // We could refresh here to be sure, but optimistic update is better
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error (re-fetch)
      refreshProjects();
    }
  };

  // Counts for tabs
  const myCount = myProjects.length;
  const favCount = favoriteProjects.length;

  return (
    <>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={`${t('myProjects')} (${myCount})`} />
        <Tab label={`${t('favorites')} (${favCount})`} />
      </Tabs>

      <ProjectSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={handleCreateClick}
      />

      <Box>
        <ProjectList
          projects={tabIndex === 0 ? myProjects : favoriteProjects}
          tabIndex={tabIndex}
          searchTerm={searchTerm}
          favoriteProjectIds={favoriteProjects.map(p => p.id)}
          onToggleFavorite={handleToggleFavorite}
          onMenuOpen={handleMenuOpen}
          onCreateClick={handleCreateClick}
          onClearSearch={() => setSearchTerm('')}
        />
      </Box>

      <ProjectContextMenu
        projects={tabIndex === 0 ? myProjects : favoriteProjects}
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

      <ModernAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
