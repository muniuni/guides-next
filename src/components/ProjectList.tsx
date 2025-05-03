'use client';
import { useMemo } from 'react';
import { Box } from '@mui/material';
import ProjectCard from './ProjectCard';
import { useSession } from 'next-auth/react';
import { Project } from '@/types/project';

interface ProjectListProps {
  projects: Project[];
  tabIndex: number;
  searchTerm: string;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
}

export default function ProjectList({
  projects,
  tabIndex,
  searchTerm,
  onMenuOpen,
}: ProjectListProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id || null;

  // Use memoization to prevent unnecessary recalculations
  const displayedProjects = useMemo(() => {
    // Sort projects by updatedAt
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Filter by tab selection (all or my projects)
    const tabFiltered = tabIndex === 0 ? sorted : sorted.filter((p) => p.userId === userId);

    // Filter by search term
    return tabFiltered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, tabIndex, searchTerm, userId]);

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
          <ProjectCard project={project} onMenuOpen={onMenuOpen} />
        </Box>
      ))}
    </Box>
  );
}
