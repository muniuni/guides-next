import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = { title: 'Project Metrics' };

interface Props {
  params: { id: string };
}

interface PerImage {
  id: string;
  url: string | null;
  _count: { scores: number };
}
interface Monthly {
  month: string;
  count: number;
}
interface AvgByQuestion {
  questionId: string;
  question: string;
  avg: number;
}
interface ApiResponse {
  perImage: PerImage[];
  monthly: Monthly[];
  avgByQuestion: AvgByQuestion[];
}

/**
 * Server component – renders **plain text** only.
 * It revalidates every minute so the numbers stay fresh.
 */
export default async function MetricsPage({ params }: Props) {
  const res = await fetch(`http://localhost:3000/api/projects/${params.id}/metrics`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) notFound();
  const data = (await res.json()) as ApiResponse;

  return (
    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
      {`=== Image-by-Image Score Counts ===\n`}
      {data.perImage
        .map((img) => `• ${img.url ?? img.id}: ${img._count.scores} score(s)`)
        .join('\n')}

      {`\n\n=== Monthly Total Scores ===\n`}
      {data.monthly.map((m) => `• ${m.month}: ${m.count} score(s)`).join('\n')}

      {`\n\n=== Average Value per Question ===\n`}
      {data.avgByQuestion
        .map((q) => `• "${q.question}": ${q.avg.toFixed(2)} (avg of values)`)
        .join('\n')}
    </div>
  );
}
