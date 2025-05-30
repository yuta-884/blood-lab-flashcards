/**
 * 日付操作のためのユーティリティ関数
 */

/**
 * 指定した日数を現在の日付に加えた新しい日付を返す
 * @param days 加算する日数
 * @returns ISO形式の日付文字列
 */
export const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // 時間をリセットして日付のみを考慮
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

/**
 * 現在の日付を返す（時間はリセット）
 * @returns ISO形式の日付文字列
 */
export const today = (): string => {
  const date = new Date();
  // 時間をリセットして日付のみを考慮
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

/**
 * 指定した日付が現在日付以前かどうかを判定
 * @param dateStr ISO形式の日付文字列
 * @returns 現在日付以前ならtrue
 */
export const isDueToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  // 時間をリセットして日付のみを比較
  now.setHours(0, 0, 0, 0);
  return date <= now;
};

/**
 * 日付をフォーマットして表示用の文字列に変換
 * @param dateStr ISO形式の日付文字列
 * @returns YYYY-MM-DD形式の文字列
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
