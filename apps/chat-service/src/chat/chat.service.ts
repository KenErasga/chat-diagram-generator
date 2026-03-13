import { Inject, Injectable } from '@nestjs/common';
import { HISTORY_ADAPTER, type IHistoryAdapter } from '../history/history.adapter.interface';
import { MODEL_PROVIDER_TOKEN, type IModelProvider } from '../providers/model-provider.interface';
import type { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(HISTORY_ADAPTER) private readonly historyAdapter: IHistoryAdapter,
    @Inject(MODEL_PROVIDER_TOKEN) private readonly modelProvider: IModelProvider
  ) {}

  async handleMessage(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const history = this.historyAdapter.get(dto.chatId);
    const response = await this.modelProvider.chat(history, dto.message);

    this.historyAdapter.append(dto.chatId, { role: 'user', content: dto.message });
    this.historyAdapter.append(dto.chatId, {
      role: 'assistant',
      content: response.content,
      diagram: response.diagram
    });

    return response;
  }
}
