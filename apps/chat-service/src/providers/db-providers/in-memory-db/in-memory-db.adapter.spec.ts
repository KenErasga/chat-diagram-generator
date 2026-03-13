import { InMemoryDbAdapter } from './in-memory-db.adapter';
import type { Turn } from './turn.type';

describe('InMemoryHistoryAdapter', () => {
  let adapter: InMemoryDbAdapter;

  beforeEach(() => {
    adapter = new InMemoryDbAdapter();
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
    const assistantTurn: Turn = { role: 'ai', content: 'hi there' };

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

  it('getAll returns empty array when store is empty', () => {
    expect(adapter.getAll()).toEqual([]);
  });

  it('getAll returns all chatIds with their turns', () => {
    const turn1: Turn = { role: 'user', content: 'hello' };
    const turn2: Turn = { role: 'user', content: 'world' };
    const TWO_SESSIONS = 2;

    adapter.append('chat-1', turn1);
    adapter.append('chat-2', turn2);

    const result = adapter.getAll();

    expect(result).toHaveLength(TWO_SESSIONS);
    expect(result).toEqual(
      expect.arrayContaining([
        { chatId: 'chat-1', turns: [turn1] },
        { chatId: 'chat-2', turns: [turn2] }
      ])
    );
  });
});
