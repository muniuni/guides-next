'use client';
import { useMemo } from 'react';
import { Box } from '@mui/material';
import ProjectCard from './ProjectCard';
import ProjectPlaceholder from './ProjectPlaceholder';
import { useSession } from 'next-auth/react';
import { Project } from '@/types/project';

interface ProjectListProps {
  projects: Project[];
  tabIndex: number;
  searchTerm: string;
  favoriteProjectIds?: string[];
  onToggleFavorite?: (projectId: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
  onCreateClick?: () => void;
  onClearSearch?: () => void;
}

export default function ProjectList({
  projects,
  tabIndex,
  searchTerm,
  favoriteProjectIds = [],
  onToggleFavorite,
  onMenuOpen,
  onCreateClick,
  onClearSearch,
}: ProjectListProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id || null;

  // Use memoization to prevent unnecessary recalculations
  const displayedProjects = useMemo(() => {
    // Sort projects by updatedAt
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Filter by tab selection (already handled by parent, but keeping sort)
    // const tabFiltered = tabIndex === 0 ? sorted : sorted.filter((p) => p.userId === userId);
    const tabFiltered = sorted;

    // Filter by search term
    return tabFiltered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, tabIndex, searchTerm, userId]);

  if (displayedProjects.length === 0) {
    let variant: 'empty' | 'no-results' | 'no-favorites' = 'empty';

    if (searchTerm) {
      variant = 'no-results';
    } else if (tabIndex === 1) {
      variant = 'no-favorites';
    }

    return (
      <ProjectPlaceholder
        variant={variant}
        onCreateClick={onCreateClick}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
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
      {displayedProjects.map((project) => (
        <Box key={project.id}>
          <ProjectCard
            project={project}
            isFavorited={favoriteProjectIds.includes(project.id)}
            onToggleFavorite={onToggleFavorite}
            onMenuOpen={onMenuOpen}
          />
        </Box>
      ))}
    </Box>
  );
}
