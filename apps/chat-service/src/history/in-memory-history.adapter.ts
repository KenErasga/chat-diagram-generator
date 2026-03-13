import { Injectable } from '@nestjs/common';
import type { IHistoryAdapter } from './history.adapter.interface';
import type { Turn } from './turn.type';

@Injectable()
export class InMemoryHistoryAdapter implements IHistoryAdapter {
  private readonly store = new Map<string, Turn[]>(); // This would be a database in a real application

  get(chatId: string): Turn[] {
    return this.store.get(chatId) ?? [];
  }

  append(chatId: string, turn: Turn): void {
    const history = this.store.get(chatId) ?? [];

    this.store.set(chatId, [...history, turn]);
  }
}
