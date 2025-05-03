'use client';

import { Box, Card, CardContent, Typography, Divider } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface ImageScoreData {
  id: string;
  image: string;
  count: number;
}

interface ImageScoreChartProps {
  data: ImageScoreData[];
  isMobile?: boolean;
}

export default function ImageScoreChart({ data, isMobile = false }: ImageScoreChartProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        height: '100%',
      }}
    >
      <CardContent
        sx={{
          p: isMobile ? 1.5 : 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          gutterBottom
          fontSize={isMobile ? 15 : 16}
          fontWeight={isMobile ? 500 : 400}
        >
          Scores per Image
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontSize={isMobile ? 12 : 13}
          paragraph={!isMobile}
          mb={isMobile ? 1 : undefined}
        >
          Distribution of scores across images
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ flex: 1, display: 'flex' }}>
          <ResponsiveContainer width="100%" height={data.length * (isMobile ? 50 : 60) + 20}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(0, 0, 0, 0.1)"
                horizontal={false}
                vertical={true}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                domain={[0, 'auto']}
                tickCount={5}
                stroke="rgba(0, 0, 0, 0.6)"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                dataKey="image"
                type="category"
                width={60}
                stroke="rgba(0, 0, 0, 0.6)"
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <image
                      href={payload.value}
                      x={-55}
                      y={isMobile ? -20 : -25}
                      width={isMobile ? 40 : 50}
                      height={isMobile ? 40 : 50}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </g>
                )}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: isMobile ? 12 : 13,
                }}
              />
              <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="count"
                  position="right"
                  fill="#000"
                  fontSize={isMobile ? 10 : 12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
