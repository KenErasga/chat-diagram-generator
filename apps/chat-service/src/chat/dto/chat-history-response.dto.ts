import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ enum: ['user', 'ai'] })
  role!: 'user' | 'ai';

  @ApiProperty()
  content!: string;

  @ApiProperty({ description: 'Mermaid diagram definition', required: false })
  diagram?: string;
}

export class ChatHistoryResponseDto {
  @ApiProperty({ description: 'Chat session identifier' })
  chatId!: string;

  @ApiProperty({ type: [MessageDto] })
  messages!: MessageDto[];
}

export class ChatListResponseDto {
  @ApiProperty({ type: [ChatHistoryResponseDto] })
  chats!: ChatHistoryResponseDto[];
}
