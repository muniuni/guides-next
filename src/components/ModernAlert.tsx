'use client';

import React from 'react';
import {
  Alert,
  AlertTitle,
  Snackbar,
  Slide,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  WarningAmberOutlined,
  CloseOutlined,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

interface ModernAlertProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  onClose: () => void;
  autoHideDuration?: number;
  variant?: 'filled' | 'outlined' | 'standard';
}

function SlideTransition(props: TransitionProps & { children: React.ReactElement }) {
  return <Slide {...props} direction="down" />;
}

const getIcon = (severity: string) => {
  const iconProps = { 
    fontSize: 'small' as const,
    sx: { color: '#000' }
  };
  
  switch (severity) {
    case 'success':
      return <CheckCircleOutlined {...iconProps} />;
    case 'error':
      return <ErrorOutlineOutlined {...iconProps} />;
    case 'warning':
      return <WarningAmberOutlined {...iconProps} />;
    case 'info':
    default:
      return <InfoOutlined {...iconProps} />;
  }
};

const getSeverityStyles = (severity: string) => {
  const baseStyles = {
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid',
    borderRadius: 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    '& .MuiAlert-icon': {
      color: '#000',
    },
    '& .MuiAlert-action': {
      color: '#000',
    },
  };

  switch (severity) {
    case 'success':
      return {
        ...baseStyles,
        borderColor: '#000',
        '& .MuiAlert-icon': {
          color: '#000',
        },
      };
    case 'error':
      return {
        ...baseStyles,
        borderColor: '#000',
        backgroundColor: '#fafafa',
      };
    case 'warning':
      return {
        ...baseStyles,
        borderColor: '#000',
        backgroundColor: '#f9f9f9',
      };
    case 'info':
    default:
      return {
        ...baseStyles,
        borderColor: '#000',
      };
  }
};

export default function ModernAlert({
  open,
  message,
  severity,
  title,
  onClose,
  autoHideDuration = 6000,
  variant = 'outlined',
}: ModernAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        top: '24px !important',
        '& .MuiSnackbar-root': {
          position: 'static',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant={variant}
        icon={getIcon(severity)}
        sx={{
          ...getSeverityStyles(severity),
          minWidth: 320,
          maxWidth: 500,
          py: 1.5,
          px: 2,
          alignItems: 'center',
          minHeight: 48,
          '& .MuiAlert-icon': {
            padding: 0,
            marginRight: 1.5,
            fontSize: '1.25rem',
            lineHeight: 1,
            alignSelf: 'center',
          },
          '& .MuiAlert-message': {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            alignItems: 'flex-start',
            justifyContent: 'center',
            flex: 1,
            alignSelf: 'center',
          },
          '& .MuiAlert-action': {
            padding: 0,
            marginLeft: 'auto',
            marginRight: -1,
            alignSelf: 'center',
            '& .MuiIconButton-root': {
              color: '#000',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5,
          alignItems: 'flex-start',
          justifyContent: 'center',
          lineHeight: 1,
        }}>
          {title && (
            <AlertTitle
              sx={{
                color: '#000',
                fontWeight: 600,
                fontSize: '1rem',
                margin: 0,
                lineHeight: 1.25,
                marginBottom: 0,
              }}
            >
              {title}
            </AlertTitle>
          )}
          <Typography
            variant="body2"
            sx={{
              color: '#000',
              fontSize: title ? '0.95rem' : '1rem',
              lineHeight: 1.25,
              fontWeight: title ? 400 : 500,
              margin: 0,
            }}
          >
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

// Hook for using the alert system
export function useModernAlert() {
  const [alert, setAlert] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showAlert = React.useCallback((
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ) => {
    setAlert({ open: true, message, severity, title });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlert(prev => ({ ...prev, open: false }));
  }, []);

  return {
    alert,
    showAlert,
    hideAlert,
    AlertComponent: (
      <ModernAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        title={alert.title}
        onClose={hideAlert}
      />
    ),
  };
}