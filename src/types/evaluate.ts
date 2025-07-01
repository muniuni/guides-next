import { Question, Image } from './project';

export interface ImageItem extends Image {}

export interface ProjectProps {
  id: string;
  imageCount: number;
  imageDuration: number;
  questions: Question[];
  images: ImageItem[];
}

export interface EvaluateClientProps {
  project: ProjectProps;
}
