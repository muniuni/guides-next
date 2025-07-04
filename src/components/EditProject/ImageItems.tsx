import React, { useMemo } from 'react';
import Image from 'next/image';
import { Paper, IconButton, Checkbox, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExistingImageItemProps, NewImageItemProps } from './types';

// 既存画像コンポーネント
export function ExistingImageItem({
  image,
  isSelectMode,
  isSelected,
  onSelect,
}: ExistingImageItemProps) {
  // 無効なURLを防止
  if (!image.url || image.url.trim() === '') {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        cursor: isSelectMode ? 'pointer' : 'default',
      }}
      onClick={() => isSelectMode && onSelect(image.id)}
    >
      {isSelectMode && (
        <Checkbox
          checked={isSelected}
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            bgcolor: 'rgba(255,255,255,0.8)',
            borderRadius: '50%',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
            },
          }}
        />
      )}
      <div style={{ position: 'relative', width: '100%', height: '120px' }}>
        <Image
          src={image.url}
          alt="画像"
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{
            objectFit: 'cover',
          }}
          priority={false}
        />
      </div>
    </Paper>
  );
}

// 新規アップロード画像コンポーネント
export function NewImageItem({ file, progress, index, onRemove }: NewImageItemProps) {
  // ファイルからオブジェクトURLを生成し、メモ化
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  // コンポーネントのアンマウント時にオブジェクトURLを解放
  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '120px' }}>
        <Image
          src={objectUrl}
          alt="新しい画像"
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{
            objectFit: 'cover',
          }}
          unoptimized // ローカルオブジェクトURLには最適化を適用しない
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgcolor: 'rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              bgcolor: 'primary.main',
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </Box>
      </div>
      <IconButton
        size="small"
        onClick={() => onRemove(index)}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          bgcolor: 'rgba(255,255,255,0.8)',
          zIndex: 1,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.9)',
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
