import type { Message } from './message.type';

export const IN_MEMORY_DB_ADAPTER = 'IN_MEMORY_DB_ADAPTER';

export interface IInMemoryDbAdapter {
  get(chatId: string): Message[];
  getAll(): Array<{ chatId: string; messages: Message[] }>;
  append(chatId: string, message: Message): void;
}
