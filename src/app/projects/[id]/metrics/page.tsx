// app/projects/[id]/metrics/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ApiResponse } from '@/types/metrics';

// MetricsDashboardを動的インポート
const MetricsDashboard = dynamic(() => import('@/components/MetricsDashboard'), {
  loading: () => (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
    >
      <CircularProgress />
    </Box>
  ),
  ssr: true,
});

// 動的メタデータを設定できるようにする
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_API_BASE_URL || ''}/api/projects/${params.id}`, {
      next: { revalidate: 3600 }, // キャッシュを1時間に設定
    });

    if (!res.ok) {
      return { title: 'Project Metrics' };
    }

    const project = await res.json();
    return {
      title: `${project.name} - Metrics`,
      description: `Analytics dashboard for ${project.name}`,
    };
  } catch (error) {
    return { title: 'Project Metrics' };
  }
}

interface Props {
  params: { id: string };
}

export default async function MetricsPage({ params }: Props) {
  try {
    // API URLの構築をより堅牢に
    const apiUrl = process.env.NEXT_API_BASE_URL || '';
    const finalUrl = `${apiUrl}/api/projects/${params.id}/metrics`;

    const res = await fetch(finalUrl, {
      next: { revalidate: 60 }, // 1分ごとにデータを再取得
    });

    if (!res.ok) {
      // エラーの種類に応じた処理
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch metrics: ${res.status}`);
    }

    const data = (await res.json()) as ApiResponse;
    return (
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <MetricsDashboard data={data} projectId={params.id} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading metrics:', error);
    // エラー表示コンポーネント
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Failed to load metrics
        </Typography>
        <Typography variant="body1">
          Please try again later or contact support if the problem persists.
        </Typography>
      </Box>
    );
  }
}
