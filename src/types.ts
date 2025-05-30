export interface Card {
  id: string;
  front: string;
  back: string[];
  category: string;
}

export type CardProgress = { box: 1 | 2 | 3; next: string }; // ISO date string
export type ProgressMap = Record<string, CardProgress>;

export const INTERVALS = { 1: 0, 2: 3, 3: 7 }; // days
