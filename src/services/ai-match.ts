import { api } from './api';
import { type Item } from './items';

export interface MatchResult {
  itemId: string;
  score: number;
  explanation: string;
  matchedItem?: Item;
}

export const findSmartMatches = async (lostItem: Item): Promise<MatchResult[]> => {
  const itemId = lostItem.id || lostItem._id;
  const matches = await api.post(`/api/ai-match/${itemId}`);
  return matches;
};
