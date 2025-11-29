import { Image } from './project';

export interface ImageItem extends Image {}

export interface Question {
  id: string;
  text: string;
}

export interface ProjectProps {
  id: string;
  imageCount: number;
  imageDuration: number;
  questions: Question[];
  images: ImageItem[];
  allowMultipleAnswers?: boolean;
  evaluationMethod?: string;
}

export interface EvaluateClientProps {
  project: ProjectProps;
}
