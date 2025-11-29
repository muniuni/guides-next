export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  images?: Image[];
  questions?: Question[];
  imageCount?: number;
  imageDuration?: number;
  consentInfo?: string;
  startDate?: string | null;
  endDate?: string | null;
  allowMultipleAnswers?: boolean;
  evaluationMethod?: string;
}

export interface Image {
  id: string;
  url: string;
  projectId?: string;
}

export interface Question {
  id: string | null;
  text: string;
  projectId?: string;
  leftLabel?: string;
  rightLabel?: string;
}
