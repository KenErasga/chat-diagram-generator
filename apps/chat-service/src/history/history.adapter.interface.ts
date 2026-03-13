import type { Turn } from './turn.type';

export const HISTORY_ADAPTER = 'HISTORY_ADAPTER';

export interface IHistoryAdapter {
  get(chatId: string): Turn[];
  append(chatId: string, turn: Turn): void;
}
