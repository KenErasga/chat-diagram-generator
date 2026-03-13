import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';

const HTTP_CREATED = 201;

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @HttpCode(HTTP_CREATED)
  handleMessage(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleMessage(dto);
  }
}
