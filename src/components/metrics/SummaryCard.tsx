'use client';

import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Tooltip,
  ClickAwayListener,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tooltip?: string;
  isMobile?: boolean;
}

export default function SummaryCard({
  title,
  value,
  icon,
  tooltip,
  isMobile = false,
}: SummaryCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const handleTooltipToggle = () => {
    setTooltipOpen(!tooltipOpen);
  };

  // モバイル版とデスクトップ版のスタイルを分ける
  if (isMobile) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          minWidth: 120,
          flexGrow: 1,
        }}
      >
        <CardContent sx={{ p: 1.5, py: 1.2 }}>
          <Box display="flex" alignItems="center" sx={{ minHeight: 32 }}>
            <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 1.5, width: 32, height: 32 }}>
              {icon}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize={12}
                lineHeight={1.2}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {title}
                {tooltip && (
                  <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                      title={tooltip}
                      arrow
                      open={tooltipOpen}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                    >
                      <InfoOutlinedIcon
                        onClick={handleTooltipToggle}
                        sx={{ fontSize: 12, ml: 0.5, color: 'text.secondary', cursor: 'help' }}
                      />
                    </Tooltip>
                  </ClickAwayListener>
                )}
              </Typography>
              <Typography
                variant="h6"
                component="div"
                fontWeight="medium"
                fontSize={18}
                lineHeight={1.3}
              >
                {value}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // デスクトップ版
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'grey.100', color: '#000', mr: 2, width: 40, height: 40 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize={13}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {title}
              {tooltip && (
                <ClickAwayListener onClickAway={handleTooltipClose}>
                  <Tooltip
                    title={tooltip}
                    arrow
                    open={tooltipOpen}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <InfoOutlinedIcon
                      onClick={handleTooltipToggle}
                      sx={{ fontSize: 12, ml: 0.5, color: 'text.secondary', cursor: 'help' }}
                    />
                  </Tooltip>
                </ClickAwayListener>
              )}
            </Typography>
            <Typography variant="h5" component="div" fontWeight="medium" fontSize={20}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
