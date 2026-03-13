import type { Turn } from './turn.type';

export const IN_MEMORY_DB_ADAPTER = 'IN_MEMORY_DB_ADAPTER';

export interface IInMemoryDbAdapter {
  get(chatId: string): Turn[];
  append(chatId: string, turn: Turn): void;
}
