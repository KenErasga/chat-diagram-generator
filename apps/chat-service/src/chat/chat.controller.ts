import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  handleMessage(@Body(ValidationPipe) dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleMessage(dto);
  }
}
