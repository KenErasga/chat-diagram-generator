import { InMemoryHistoryAdapter } from './in-memory-history.adapter';
import type { Turn } from './turn.type';

describe('InMemoryHistoryAdapter', () => {
  let adapter: InMemoryHistoryAdapter;

  beforeEach(() => {
    adapter = new InMemoryHistoryAdapter();
  });

  it('returns empty array for unknown chatId', () => {
    expect(adapter.get('new-id')).toEqual([]);
  });

  it('returns the appended turn after append', () => {
    const turn: Turn = { role: 'user', content: 'hello' };

    adapter.append('chat-1', turn);

    expect(adapter.get('chat-1')).toEqual([turn]);
  });

  it('accumulates multiple turns in order', () => {
    const userTurn: Turn = { role: 'user', content: 'hello' };
    const assistantTurn: Turn = { role: 'assistant', content: 'hi there' };

    adapter.append('chat-1', userTurn);
    adapter.append('chat-1', assistantTurn);

    expect(adapter.get('chat-1')).toEqual([userTurn, assistantTurn]);
  });

  it('keeps histories isolated per chatId', () => {
    adapter.append('chat-1', { role: 'user', content: 'message for chat-1' });
    adapter.append('chat-2', { role: 'user', content: 'message for chat-2' });

    expect(adapter.get('chat-1')).toHaveLength(1);
    expect(adapter.get('chat-2')).toHaveLength(1);
  });
});
