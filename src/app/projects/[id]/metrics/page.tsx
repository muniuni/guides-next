// app/projects/[id]/metrics/page.tsx
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MetricsDashboard, { ApiResponse } from '@/components/MetricsDashboard';

export const metadata: Metadata = { title: 'Project Metrics' };

interface Props {
  params: { id: string };
}

export default async function MetricsPage({ params }: Props) {
  const headersData = headers();
  const host = (await headersData).get('host');
  const protocol =
    ((await headersData).get('x-forwarded-proto') ?? host.startsWith('localhost'))
      ? 'http'
      : 'https';
  const apiBase = `${protocol}://${host}`;

  const res = await fetch(`${apiBase}/api/projects/${params.id}/metrics`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) notFound();

  const data = (await res.json()) as ApiResponse;

  return <MetricsDashboard data={data} projectId={params.id} />;
}
