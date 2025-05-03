export interface Question {
  id: string;
  text: string;
}

export interface ImageItem {
  id: string;
  url: string;
}

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
