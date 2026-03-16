import { Injectable } from '@nestjs/common';
import type { IInMemoryDbAdapter } from './in-memory-db.adapter.interface';
import type { Message } from './message.type';

@Injectable()
export class InMemoryDbAdapter implements IInMemoryDbAdapter {
  private readonly store = new Map<string, Message[]>();

  get(chatId: string): Message[] {
    return this.store.get(chatId) ?? [];
  }

  getAll(): Array<{ chatId: string; messages: Message[] }> {
    return Array.from(this.store.entries()).map(([chatId, messages]) => ({ chatId, messages }));
  }

  append(chatId: string, message: Message): void {
    const history = this.store.get(chatId) ?? [];

    this.store.set(chatId, [...history, message]);
  }
}
