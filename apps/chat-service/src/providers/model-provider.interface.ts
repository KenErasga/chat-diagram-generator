import type { ChatResponseDto } from '../chat/dto/chat-response.dto';
import type { Turn } from './db-providers/in-memory-db/turn.type';

export const MODEL_PROVIDER_TOKEN = 'MODEL_PROVIDER_TOKEN';

export interface IModelProvider {
  chat(history: Turn[], message: string): Promise<ChatResponseDto>;
}
