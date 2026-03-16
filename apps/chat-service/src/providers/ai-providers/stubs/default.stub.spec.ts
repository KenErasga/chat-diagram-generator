import { DefaultStub } from './default.stub';
import type { Message } from '../../db-providers/in-memory-db/message.type';

describe('DefaultStub', () => {
  const stub = new DefaultStub();

  it('returns a diagram response when message includes "create"', async () => {
    const result = await stub.chat([], 'Create a diagram please');

    expect(result.type).toBe('diagram');
    expect(typeof result.diagram).toBe('string');
    expect(result.diagram!.length).toBeGreaterThan(0);
  });

  it('returns a message response for plain messages', async () => {
    const result = await stub.chat([], 'Hello there');

    expect(result.type).toBe('message');
    expect(result.diagram).toBeUndefined();
  });

  it('matches "create" case-insensitively', async () => {
    const result = await stub.chat([], 'CREATE a flowchart');

    expect(result.type).toBe('diagram');
  });

  it('does not break when non-empty history is provided', async () => {
    const history: Message[] = [
      { role: 'user', content: 'prior message' },
      { role: 'ai', content: 'prior reply' }
    ];
    const result = await stub.chat(history, 'Hello');

    expect(result.type).toBe('message');
  });
});
