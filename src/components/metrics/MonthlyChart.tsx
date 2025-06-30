'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Card, CardContent, Typography, Divider } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Monthly } from '@/types/metrics';

interface MonthlyChartProps {
  data: Monthly[];
  isMobile?: boolean;
}

export default function MonthlyChart({ data, isMobile = false }: MonthlyChartProps) {
  const t = useTranslations('metrics');
  
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          gutterBottom
          fontSize={isMobile ? 15 : 16}
          fontWeight={isMobile ? 500 : 400}
        >
          {t('monthlyRespondents')}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize={isMobile ? 12 : 13} mb={1}>
          {t('monthlySubtitle')}
        </Typography>
        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
        <Box height={{ xs: 220, sm: 320, md: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(0, 0, 0, 0.1)"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="rgba(0, 0, 0, 0.6)"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.split('-')[1]} // Only show month part
              />
              <YAxis
                allowDecimals={false}
                padding={{ top: 20 }}
                domain={[0, 'auto']}
                tickCount={5}
                stroke="rgba(0, 0, 0, 0.6)"
                tick={{ fontSize: 10 }}
                width={30}
                axisLine={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: 11,
                }}
              />
              <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" fill="#000" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
