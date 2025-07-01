/**
 * 実施期間に関するユーティリティ関数
 */

export interface DurationStatus {
  isActive: boolean;
  isStarted: boolean;
  isEnded: boolean;
}

/**
 * プロジェクトの実施期間ステータスを判定する
 */
export function getDurationStatus(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): DurationStatus {
  const now = new Date();
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  const isStarted = start ? now >= start : true; // 開始日がない場合は常に開始済み
  const isEnded = end ? now > end : false; // 終了日がない場合は終了していない
  
  const isActive = isStarted && !isEnded;
  
  return {
    isActive,
    isStarted,
    isEnded,
  };
}

/**
 * 日付を YYYY/M/D 形式でフォーマットする
 */
export function formatDateForDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}/${month}/${day}`;
}

/**
 * 日付を YYYY-MM-DD 形式でフォーマットする（input[type="date"]用）
 */
export function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

/**
 * input[type="date"]の値をISO文字列に変換する
 */
export function parseInputDate(inputValue: string): string | null {
  if (!inputValue) return null;
  
  // YYYY-MM-DD 形式の文字列をDateオブジェクトに変換
  const date = new Date(inputValue + 'T00:00:00.000Z');
  return date.toISOString();
}