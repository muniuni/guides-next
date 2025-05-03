import { useState } from 'react';
import { ImageRecord, NumberFieldReturn, ImageSelectionReturn } from './types';

// カスタムフック：数値入力フィールド用
export function useNumberField(initialValue: number): NumberFieldReturn {
  const [value, setValue] = useState<string>(initialValue.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    if (inputValue !== '') {
      const num = parseInt(inputValue);
      if (!isNaN(num)) {
        setValue(num.toString());
      }
    }
  };

  const handleBlur = () => {
    if (value === '') {
      setValue('0');
    }
  };

  return { value, handleChange, handleBlur };
}

// カスタムフック：画像選択モード
export function useImageSelection(): ImageSelectionReturn {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectModeToggle = () => {
    setIsSelectMode(true);
    setSelectedImages(new Set());
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedImages(new Set());
  };

  return {
    selectedImages,
    isSelectMode,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleImageSelect,
    handleSelectModeToggle,
    exitSelectMode,
  };
}
