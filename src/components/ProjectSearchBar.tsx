'use client';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';

interface ProjectSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export default function ProjectSearchBar({
  searchTerm,
  onSearchChange,
  onCreateClick,
}: ProjectSearchBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session } = useSession();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
      <TextField
        size="small"
        placeholder="Search projects"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
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
          onClick={onCreateClick}
          sx={{ bgcolor: '#000', color: '#fff' }}
        >
          {isMobile ? 'New' : 'New Project'}
        </Button>
      )}
    </Box>
  );
}
