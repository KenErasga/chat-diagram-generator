import { Logger } from '@nestjs/common';
import type { ChatResponseDto } from '../../chat/dto/chat-response.dto';
import type { IModelProvider } from '../model-provider.interface';
import type { Turn } from '../db-providers/in-memory-db/turn.type';
import { DIAGRAM_DEFINITION } from './stub-fixtures';

export class BaseStub implements IModelProvider {
  private readonly logger = new Logger(BaseStub.name);

  async chat(_history: Turn[], message: string): Promise<ChatResponseDto> {
    if (message.toLowerCase().includes('create')) {
      this.logger.debug('Detected "create" keyword — returning diagram response');

      return { type: 'diagram', content: 'Here is your diagram.', diagram: DIAGRAM_DEFINITION };
    }

    this.logger.debug('No "create" keyword — returning message response');

    return { type: 'message', content: `Got your message: ${message}` };
  }
}
