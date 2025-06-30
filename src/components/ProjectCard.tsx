'use client';
import { useSession } from 'next-auth/react';
import { useTransition, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/config';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';
import { truncate, formatDate, timeAgo } from '@/lib/project-utils';

import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
}

const MAX_DESCRIPTION_LENGTH = 45;

export default function ProjectCard({ project, onMenuOpen }: ProjectCardProps) {
  const t = useTranslations('projects');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isOwner = project.userId === userId;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // ローディング状態を追跡
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);
  const [loadingCopyLink, setLoadingCopyLink] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // パス名が変更された場合、ローディング状態をリセット
  useEffect(() => {
    // ローディング状態のリセット
    setLoadingEdit(false);
    setLoadingMetrics(false);
    setLoadingEvaluate(false);
    setLoadingCopyLink(false);
    setShowCopySuccess(false);
  }, [pathname]);

  // 編集ページへの遷移処理
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    setLoadingEdit(true);
    startTransition(() => {
      router.push(`/projects/${project.id}/edit`);
    });
  };

  // メトリクスページへの遷移処理
  const handleMetricsClick = (e: React.MouseEvent) => {
    e.preventDefault();

    setLoadingMetrics(true);
    startTransition(() => {
      router.push(`/projects/${project.id}/metrics`);
    });
  };

  // 評価ページへの遷移処理
  const handleEvaluateClick = (e: React.MouseEvent) => {
    e.preventDefault();

    setLoadingEvaluate(true);
    startTransition(() => {
      router.push(`/projects/${project.id}`);
    });
  };

  // リンクコピー処理
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingCopyLink || showCopySuccess) return;

    setLoadingCopyLink(true);

    const url = `${window.location.origin}/projects/${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    // Show loading for a short time, then success
    setTimeout(() => {
      setLoadingCopyLink(false);
      setShowCopySuccess(true);

      // Hide success icon after 2 seconds
      setTimeout(() => {
        setShowCopySuccess(false);
      }, 2000);
    }, 500);
  };

  // 遷移が完了したらローディング状態をリセット
  // 注: Next.jsはクライアントサイドナビゲーション後に自動的にページをリロードしないため
  // サーバーコンポーネントでもこの実装は機能する
  return (
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
            content: project.images && project.images.length > 0 ? 'none' : `"${t('noImage')}"`,
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
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              MozTouchCallout: 'none',
              MozUserSelect: 'none',
              userSelect: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
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
            {isOwner && (
              <Link href={`/projects/${project.id}/edit`} passHref prefetch>
                <Tooltip title={t('editProject')}>
                  <IconButton
                    onClick={handleEditClick}
                    disabled={loadingEdit}
                    size="small"
                    sx={{ position: 'relative' }}
                    component="span"
                  >
                    {loadingEdit ? (
                      <CircularProgress size={20} thickness={5} />
                    ) : (
                      <CreateOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Link>
            )}
            {!isOwner && (
              <IconButton
                disabled={true}
                size="small"
                sx={{ position: 'relative', visibility: 'hidden' }}
              >
                <CreateOutlinedIcon fontSize="small" />
              </IconButton>
            )}
            <Link href={`/projects/${project.id}/metrics`} passHref prefetch>
              <Tooltip title={t('viewMetrics')}>
                <IconButton
                  onClick={handleMetricsClick}
                  disabled={loadingMetrics}
                  size="small"
                  sx={{ position: 'relative' }}
                  component="span"
                >
                  {loadingMetrics ? (
                    <CircularProgress size={20} thickness={5} />
                  ) : (
                    <AssessmentOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Link>
            <IconButton onClick={(e) => onMenuOpen(e, project.id)} size="small">
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ ml: 0.5 }}>
          By {project.user.username}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {truncate(project.description, MAX_DESCRIPTION_LENGTH)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
          {formatDate(project.createdAt)}
        </Typography>
        <Typography variant="caption" display="block">
          <ScheduleOutlinedIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
          {timeAgo(project.updatedAt)}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, gap: 0.1 }}>
        <Link href={`/projects/${project.id}`} passHref prefetch style={{ flex: '9.5' }}>
          <Button
            variant="outlined"
            fullWidth
            disabled={loadingEvaluate}
            onClick={handleEvaluateClick}
            sx={{
              textTransform: 'none',
              position: 'relative',
            }}
            component="span"
          >
            {loadingEvaluate ? (
              <>
                <CircularProgress size={20} thickness={5} sx={{ mr: 1 }} />
                {t('loading')}
              </>
            ) : (
              t('startEvaluation')
            )}
          </Button>
        </Link>
        <Tooltip title={t('copyLink')}>
          <Button
            variant="outlined"
            onClick={handleCopyLink}
            disabled={loadingCopyLink || showCopySuccess}
            sx={{
              flex: '0.5',
              minWidth: 'auto',
              textTransform: 'none',
              position: 'relative',
              px: 1,
              height: '36px',
            }}
          >
            {loadingCopyLink ? (
              <CircularProgress size={20} thickness={5} />
            ) : showCopySuccess ? (
              <CheckIcon fontSize="small" />
            ) : (
              <LinkIcon fontSize="small" />
            )}
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
