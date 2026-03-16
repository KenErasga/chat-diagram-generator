import type { ChatResponseDto } from '../chat/dto/chat-response.dto';
import type { Message } from './db-providers/in-memory-db/message.type';

export const MODEL_PROVIDER_TOKEN = 'MODEL_PROVIDER_TOKEN';

export interface IModelProvider {
  chat(history: Message[], message: string): Promise<ChatResponseDto>;
}
