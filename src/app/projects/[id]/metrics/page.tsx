// app/projects/[id]/metrics/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MetricsDashboard, { ApiResponse } from '@/components/MetricsDashboard';

export const metadata: Metadata = { title: 'Project Metrics' };

interface Props {
  params: { id: string };
}

export default async function MetricsPage({ params }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}/api/projects/${params.id}/metrics`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) notFound();

  const data = (await res.json()) as ApiResponse;

  return <MetricsDashboard data={data} projectId={params.id} />;
}
