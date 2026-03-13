import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IN_MEMORY_DB_ADAPTER,
  type IInMemoryDbAdapter
} from '../providers/db-providers/in-memory-db/in-memory-db.adapter.interface';
import { MODEL_PROVIDER_TOKEN, type IModelProvider } from '../providers/model-provider.interface';
import type { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';

const MESSAGE_PREVIEW_LENGTH = 80;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(IN_MEMORY_DB_ADAPTER) private readonly historyAdapter: IInMemoryDbAdapter,
    @Inject(MODEL_PROVIDER_TOKEN) private readonly modelProvider: IModelProvider
  ) {}

  async handleMessage(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const history = this.historyAdapter.get(dto.chatId);
    const preview = dto.message.slice(0, MESSAGE_PREVIEW_LENGTH);

    this.logger.log(`chatId="${dto.chatId}" historyLength=${history.length} message="${preview}"`);

    let response: ChatResponseDto;

    try {
      response = await this.modelProvider.chat(history, dto.message);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Provider failed for chatId="${dto.chatId}": ${err.message}`, err.stack);
      } else {
        this.logger.error(`Provider failed for chatId="${dto.chatId}"`, String(err));
      }

      throw err;
    }

    this.logger.log(`chatId="${dto.chatId}" responseType="${response.type}"`);

    this.historyAdapter.append(dto.chatId, { role: 'user', content: dto.message });
    this.historyAdapter.append(dto.chatId, {
      role: 'assistant',
      content: response.content,
      diagram: response.diagram
    });

    return response;
  }
}
