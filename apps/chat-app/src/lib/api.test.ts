import { postChat } from './api';

describe('postChat', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves with typed response on 200', async () => {
    const mockBody = { type: 'message', content: 'hello' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBody)
    } as Response);

    const result = await postChat({ chatId: 'abc', message: 'hi' });

    expect(result).toEqual(mockBody);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ chatId: 'abc', message: 'hi' }) })
    );
  });

  it('resolves with diagram response when type is diagram', async () => {
    const mockBody = { type: 'diagram', content: 'Here is your diagram', diagram: 'flowchart TD\n  A --> B' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBody)
    } as Response);

    const result = await postChat({ chatId: 'abc', message: 'create a diagram' });

    expect(result).toEqual(mockBody);
    expect(result.diagram).toBe('flowchart TD\n  A --> B');
  });

  it('throws on non-2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(postChat({ chatId: 'abc', message: 'hi' })).rejects.toThrow('Request failed with status 500');
  });
});
