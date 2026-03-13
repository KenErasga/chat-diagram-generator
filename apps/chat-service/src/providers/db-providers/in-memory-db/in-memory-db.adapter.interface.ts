import type { Turn } from './turn.type';

export const IN_MEMORY_DB_ADAPTER = 'IN_MEMORY_DB_ADAPTER';

export interface IInMemoryDbAdapter {
  get(chatId: string): Turn[];
  getAll(): Array<{ chatId: string; turns: Turn[] }>;
  append(chatId: string, turn: Turn): void;
}
