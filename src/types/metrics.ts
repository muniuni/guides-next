export interface PerImage {
  id: string;
  url: string | null;
  _count: { scores: number };
}

export interface Monthly {
  month: string;
  count: number;
}

export interface AvgByQuestion {
  questionId: string;
  question: string;
  avg: number;
}

export interface QuestionScorePerImage {
  imageId: string;
  questionId: string;
  avg: number;
}

export interface ApiResponse {
  perImage: PerImage[];
  monthly: Monthly[];
  avgByQuestion: AvgByQuestion[];
  uniqueRespondents?: number;
  totalScores?: number;
  questionScoresPerImage?: QuestionScorePerImage[];
}

export interface MetricsDashboardProps {
  data?: ApiResponse;
  projectId?: string;
}
