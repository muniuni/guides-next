// 共通スタイル
export const CARD_STYLES = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  elevation: 0,
};

export const CARD_HEADER_STYLES = {
  pb: 1,
  px: { xs: 2, sm: 3 },
};

export const CARD_CONTENT_STYLES = {
  px: { xs: 2, sm: 3 },
};

export const BUTTON_STYLES = {
  borderRadius: 2,
  whiteSpace: 'nowrap' as const,
  minWidth: 'auto',
  px: { xs: 1, sm: 2 },
};

export const INPUT_HEIGHT_STYLES = {
  '& .MuiInputBase-root': {
    height: { xs: 48, sm: 40 },
  },
};
