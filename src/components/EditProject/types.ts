import { Question, Image } from '@/types/project';

export interface ImageRecord extends Image {}

export interface Project {
  id: string;
  name: string;
  description: string;
  consentInfo: string;
  imageCount: number;
  imageDuration: number;
  questions: Question[];
  images: ImageRecord[];
}

export interface EditProjectFormProps {
  initialProject: {
    id: string;
    name: string;
    description: string;
    consentInfo: string;
    imageCount: number;
    imageDuration: number;
    questions: Question[];
    images: ImageRecord[];
  };
}

// 数値フィールドの返り値型定義
export interface NumberFieldReturn {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
}

// 画像選択フックの戻り値型定義
export interface ImageSelectionReturn {
  selectedImages: Set<string>;
  isSelectMode: boolean;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageSelect: (imageId: string) => void;
  handleSelectModeToggle: () => void;
  exitSelectMode: () => void;
}

// 一般情報フォームプロップスの型定義
export interface GeneralInformationCardProps {
  projectName: string;
  setProjectName: (value: string) => void;
  projectDesc: string;
  setProjectDesc: (value: string) => void;
  consentText: string;
  setConsentText: (value: string) => void;
  imageCountInfo: NumberFieldReturn;
  imageDurationInfo: NumberFieldReturn;
  isImageCountValid: boolean;
  totalImages: number;
}

// 質問フォームプロップスの型定義
export interface QuestionsCardProps {
  questionList: Question[];
  addQuestion: () => void;
  updateQuestion: (index: number, text: string) => void;
  removeQuestion: (index: number) => void;
}

// 画像管理プロップスの型定義
export interface ImagesCardProps {
  existingImages: ImageRecord[];
  uploadingFiles: { file: File; progress: number }[];
  isSelectMode: boolean;
  selectedImages: Set<string>;
  handleImageSelect: (imageId: string) => void;
  handleSelectModeToggle: () => void;
  exitSelectMode: () => void;
  setDeleteDialogOpen: (open: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 既存画像アイテムプロップスの型定義
export interface ExistingImageItemProps {
  image: ImageRecord;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (imageId: string) => void;
}

// 新規画像アイテムプロップスの型定義
export interface NewImageItemProps {
  file: File;
  progress: number;
  index: number;
  onRemove: (index: number) => void;
}
