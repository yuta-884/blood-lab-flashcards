import type { CardProgress, ProgressMap } from '../types';
import { INTERVALS } from '../types';
import type { Card } from '../types';
import { addDays, today } from './dateUtils';

/**
 * カードの進捗を更新する
 * @param progressMap 現在の進捗マップ
 * @param cardId カードID
 * @param correct 正解かどうか
 * @returns 更新された進捗マップ
 */
export const updateProgress = (
  progressMap: ProgressMap,
  cardId: string,
  correct: boolean
): ProgressMap => {
  const currentProgress = progressMap[cardId] || { box: 1, next: today() };
  
  let newBox: 1 | 2 | 3;
  let nextReviewDate: string;
  
  if (correct) {
    // 正解の場合、boxを1つ上げる（最大3）
    newBox = (currentProgress.box < 3 ? currentProgress.box + 1 : 3) as 1 | 2 | 3;
    // 次回レビュー日を計算
    nextReviewDate = addDays(INTERVALS[newBox]);
  } else {
    // 不正解の場合、box1に戻す
    newBox = 1;
    // 次回レビュー日を今日に設定
    nextReviewDate = today();
  }
  
  // 新しい進捗情報を作成
  const newProgress: CardProgress = {
    box: newBox,
    next: nextReviewDate
  };
  
  // 進捗マップを更新して返す
  return {
    ...progressMap,
    [cardId]: newProgress
  };
};

/**
 * 今日学習すべきカードを抽出する
 * @param cards すべてのカード
 * @param progressMap 進捗マップ
 * @returns 今日学習すべきカード
 */
export const getDueCards = (cards: Card[], progressMap: ProgressMap): Card[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return cards.filter(card => {
    const progress = progressMap[card.id];
    // 進捗情報がない、または次回レビュー日が今日以前の場合
    return !progress || new Date(progress.next) <= now;
  });
};

/**
 * 箱ごとのカード数を計算する
 * @param progressMap 進捗マップ
 * @returns 箱ごとのカード数 [box1, box2, box3]
 */
export const getBoxCounts = (progressMap: ProgressMap): [number, number, number] => {
  const counts: [number, number, number] = [0, 0, 0];
  
  Object.values(progressMap).forEach(progress => {
    // 箱に応じてカウントを増やす
    counts[progress.box - 1]++;
  });
  
  return counts;
};
