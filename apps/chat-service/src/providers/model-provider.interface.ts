import type { ChatResponseDto } from '../chat/dto/chat-response.dto';
import type { Turn } from '../history/turn.type';

export const MODEL_PROVIDER_TOKEN = 'MODEL_PROVIDER_TOKEN';

export interface IModelProvider {
  chat(history: Turn[], message: string): Promise<ChatResponseDto>;
}
