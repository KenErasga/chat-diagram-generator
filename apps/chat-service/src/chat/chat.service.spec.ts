import { ChatService } from './chat.service';
import type { ChatResponseDto } from './dto/chat-response.dto';
import type { IHistoryAdapter } from '../history/history.adapter.interface';
import type { IModelProvider } from '../providers/model-provider.interface';
import type { Turn } from '../history/turn.type';

describe('ChatService', () => {
  let service: ChatService;
  let historyAdapter: jest.Mocked<IHistoryAdapter>;
  let modelProvider: jest.Mocked<IModelProvider>;

  beforeEach(() => {
    historyAdapter = { get: jest.fn(), append: jest.fn() };
    modelProvider = { chat: jest.fn() };
    service = new ChatService(historyAdapter, modelProvider);
  });

  it('fetches history, calls provider, appends both turns, and returns response', async () => {
    const existingHistory: Turn[] = [{ role: 'user', content: 'prior message' }];
    const mockResponse: ChatResponseDto = { type: 'message', content: 'hi there' };

    historyAdapter.get.mockReturnValue(existingHistory);
    modelProvider.chat.mockResolvedValue(mockResponse);

    const result = await service.handleMessage({ chatId: 'abc', message: 'hello' });

    expect(historyAdapter.get).toHaveBeenCalledWith('abc');
    expect(modelProvider.chat).toHaveBeenCalledWith(existingHistory, 'hello');
    expect(historyAdapter.append).toHaveBeenNthCalledWith(1, 'abc', { role: 'user', content: 'hello' });
    expect(historyAdapter.append).toHaveBeenNthCalledWith(2, 'abc', {
      role: 'assistant',
      content: 'hi there',
      diagram: undefined
    });
    expect(result).toBe(mockResponse);
  });

  it('appends diagram to assistant turn when response includes diagram', async () => {
    const mockResponse: ChatResponseDto = {
      type: 'diagram',
      content: 'Here is your diagram.',
      diagram: 'flowchart TD\n  A --> B'
    };

    historyAdapter.get.mockReturnValue([]);
    modelProvider.chat.mockResolvedValue(mockResponse);

    await service.handleMessage({ chatId: 'abc', message: 'create a diagram' });

    expect(historyAdapter.append).toHaveBeenNthCalledWith(2, 'abc', {
      role: 'assistant',
      content: 'Here is your diagram.',
      diagram: 'flowchart TD\n  A --> B'
    });
  });
});
