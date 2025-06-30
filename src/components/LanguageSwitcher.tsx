'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/config';
import {
  ButtonBase,
  Menu,
  MenuItem,
  Typography,
  Box,
  alpha,
  Fade,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';

const languages = [
  { code: 'en', name: 'English', shortName: 'EN', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', shortName: 'JA', flag: '🇯🇵' }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isPending) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      handleClose();
      return;
    }
    
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === locale);
  const open = Boolean(anchorEl);

  return (
    <>
      <ButtonBase
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isPending}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          mr: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: open ? 'primary.main' : alpha('#000', 0.12),
          backgroundColor: open 
            ? alpha('#000', 0.04)
            : isHovered 
              ? alpha('#000', 0.02)
              : 'transparent',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isPending ? 0.6 : 1,
          minWidth: 76,
          height: 32,
          '&:hover': {
            borderColor: alpha('#000', 0.24),
            backgroundColor: alpha('#000', 0.04),
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:disabled': {
            pointerEvents: 'none',
          },
        }}
        aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <LanguageIcon 
            sx={{ 
              fontSize: 16,
              color: alpha('#000', 0.7),
            }} 
          />
          <Typography 
            component="span" 
            sx={{ 
              fontSize: 13, 
              fontWeight: 500,
              color: 'text.primary',
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {currentLanguage?.shortName}
          </Typography>
        </Box>
        <KeyboardArrowDownIcon 
          sx={{ 
            fontSize: 16,
            color: alpha('#000', 0.6),
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }} 
        />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        transitionDuration={200}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        MenuListProps={{
          dense: true,
          sx: {
            py: 0.5,
          },
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 160,
            mt: 0.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha('#000', 0.08),
            backgroundImage: 'none',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mx: 0.5,
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          },
        }}
      >
        {languages.map((language) => {
          const isSelected = language.code === locale;
          return (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              sx={{
                py: 1,
                px: 1.5,
                minHeight: 40,
                backgroundColor: isSelected ? alpha('#000', 0.04) : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected 
                    ? alpha('#000', 0.08) 
                    : alpha('#000', 0.04),
                },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
              }}>
                <Typography 
                  component="span" 
                  sx={{ 
                    fontSize: 14,
                    fontWeight: isSelected ? 500 : 400,
                    color: 'text.primary',
                    lineHeight: 1,
                  }}
                >
                  {language.name}
                </Typography>
                {isSelected && (
                  <CheckIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: 'primary.main',
                      ml: 1,
                    }} 
                  />
                )}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}