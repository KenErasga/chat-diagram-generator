import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const CHAT_ID_MAX_LENGTH = 36;
const MESSAGE_MAX_LENGTH = 10000;

export class ChatRequestDto {
  @ApiProperty({ description: 'Stable session identifier (UUID)', maxLength: CHAT_ID_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(CHAT_ID_MAX_LENGTH)
  chatId!: string;

  @ApiProperty({ description: 'User message text', maxLength: MESSAGE_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MESSAGE_MAX_LENGTH)
  message!: string;
}
