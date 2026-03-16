import { InMemoryDbAdapter } from './in-memory-db.adapter';
import type { Message } from './message.type';

describe('InMemoryDbAdapter', () => {
  let adapter: InMemoryDbAdapter;

  beforeEach(() => {
    adapter = new InMemoryDbAdapter();
  });

  it('returns empty array for unknown chatId', () => {
    expect(adapter.get('new-id')).toEqual([]);
  });

  it('returns the appended message after append', () => {
    const message: Message = { role: 'user', content: 'hello' };

    adapter.append('chat-1', message);

    expect(adapter.get('chat-1')).toEqual([message]);
  });

  it('accumulates multiple messages in order', () => {
    const userMessage: Message = { role: 'user', content: 'hello' };
    const assistantMessage: Message = { role: 'ai', content: 'hi there' };

    adapter.append('chat-1', userMessage);
    adapter.append('chat-1', assistantMessage);

    expect(adapter.get('chat-1')).toEqual([userMessage, assistantMessage]);
  });

  it('keeps histories isolated per chatId', () => {
    adapter.append('chat-1', { role: 'user', content: 'message for chat-1' });
    adapter.append('chat-2', { role: 'user', content: 'message for chat-2' });

    expect(adapter.get('chat-1')).toHaveLength(1);
    expect(adapter.get('chat-2')).toHaveLength(1);
  });

  it('getAll returns empty array when store is empty', () => {
    expect(adapter.getAll()).toEqual([]);
  });

  it('getAll returns all chatIds with their messages', () => {
    const message1: Message = { role: 'user', content: 'hello' };
    const message2: Message = { role: 'user', content: 'world' };
    const TWO_SESSIONS = 2;

    adapter.append('chat-1', message1);
    adapter.append('chat-2', message2);

    const result = adapter.getAll();

    expect(result).toHaveLength(TWO_SESSIONS);
    expect(result).toEqual(
      expect.arrayContaining([
        { chatId: 'chat-1', messages: [message1] },
        { chatId: 'chat-2', messages: [message2] }
      ])
    );
  });
});
