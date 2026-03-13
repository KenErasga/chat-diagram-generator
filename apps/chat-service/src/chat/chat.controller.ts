import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ChatHistoryResponseDto, ChatListResponseDto } from './dto/chat-history-response.dto';

@ApiTags('chat')
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message and get a diagram or text response' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ChatResponseDto })
  handleMessage(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleMessage(dto);
  }

  @Get('chat')
  @ApiOperation({ summary: 'List all chat sessions and their histories' })
  @ApiResponse({ status: HttpStatus.OK, type: ChatListResponseDto })
  getAllChats(): ChatListResponseDto {
    return this.chatService.getAllChats();
  }

  @Get('chat/:chatId')
  @ApiOperation({ summary: 'Get conversation history for a chat session' })
  @ApiParam({ name: 'chatId', description: 'The chat session identifier' })
  @ApiResponse({ status: HttpStatus.OK, type: ChatHistoryResponseDto })
  getHistory(@Param('chatId') chatId: string): ChatHistoryResponseDto {
    return this.chatService.getHistory(chatId);
  }
}
