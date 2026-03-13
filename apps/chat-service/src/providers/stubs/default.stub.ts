import { Injectable } from '@nestjs/common';
import type { ChatResponseDto } from '../../chat/dto/chat-response.dto';
import type { IModelProvider } from '../model-provider.interface';
import type { Turn } from '../../history/turn.type';

const DIAGRAM_DEFINITION = `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Result A]
  B -->|No| D[Result B]`;

@Injectable()
export class DefaultStub implements IModelProvider {
  async chat(_history: Turn[], message: string): Promise<ChatResponseDto> {
    if (message.toLowerCase().includes('create')) {
      return { type: 'diagram', content: 'Here is your diagram.', diagram: DIAGRAM_DEFINITION };
    }

    return { type: 'message', content: `Got your message: ${message}` };
  }
}
