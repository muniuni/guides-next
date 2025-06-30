'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/config';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSession, signOut } from 'next-auth/react';
import { mutate } from 'swr';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Avatar from '@mui/material/Avatar';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isLoggedIn = status === 'authenticated';
  const [open, setOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleOpen = () => setOpen(false);
  const handleClose = () => setOpen(false);

  const handleSuccess = async () => {
    setOpen(false);
    await mutate('/api/projects');
  };

  const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: '#ffffff',
          color: '#000',
          boxShadow: 0.5,
          top: 0,
          pt: 0.5,
          pb: 0.5,
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 3 } }}>
          <Box
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover .dot1': { transform: 'translateY(2px)' },
              '&:hover .dot2': { transform: 'translateY(-4px)' },
              '&:hover .dot3': { transform: 'translateY(2px)' },
            }}
          >
            <Box
              className="dot1"
              sx={{
                width: 8,
                height: 8,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                mr: 0.5,
                transition: 'transform 0.3s',
              }}
            />
            <Box
              className="dot2"
              sx={{
                width: 8,
                height: 8,
                bgcolor: 'secondary.main',
                borderRadius: '50%',
                mr: 0.5,
                transition: 'transform 0.3s',
              }}
            />
            <Box
              className="dot3"
              sx={{
                width: 8,
                height: 8,
                bgcolor: 'error.main',
                borderRadius: '50%',
                mr: 1,
                transition: 'transform 0.3s',
              }}
            />
            <Typography
              variant="h6"
              component="span"
              sx={{ color: '#000', fontWeight: 'bold', ml: 0.2 }}
            >
              n-GUIDES
            </Typography>
          </Box>

          {!isLoading &&
            (isLoggedIn ? (
              <>
                <LanguageSwitcher />
                <IconButton
                  edge="end"
                  size="small"
                  onClick={openMenu}
                  sx={{
                    color: '#000',
                    mr: { xs: 0, sm: 0.1 },
                    p: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'black',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {getInitial(session?.user?.username || '')}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    sx={{
                      py: 1.5,
                      cursor: 'default',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                      }}
                    >
                      {session?.user?.username}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} href="/auth/account" onClick={closeMenu}>
                    <PermIdentityOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    {tNav('account')}
                  </MenuItem>
                  <MenuItem component={Link} href="/about" onClick={closeMenu} disabled={true}>
                    <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    About n-GUIDES
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {t('logout')}
                    </ListItemIcon>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <LanguageSwitcher />
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#000',
                      color: '#000',
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: 'auto', sm: 'auto' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/signup"
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      borderRadius: 3,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: 'auto', sm: 'auto' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      whiteSpace: 'nowrap',
                      boxShadow: 0.1,
                    }}
                  >
                    {t('register')}
                  </Button>
                </Box>
              </>
            ))}
        </Toolbar>
      </AppBar>
    </>
  );
}
