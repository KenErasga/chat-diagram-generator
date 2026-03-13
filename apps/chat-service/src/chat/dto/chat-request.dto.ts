import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const CHAT_ID_MAX_LENGTH = 36;
const MESSAGE_MAX_LENGTH = 10000;

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(CHAT_ID_MAX_LENGTH)
  chatId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MESSAGE_MAX_LENGTH)
  message!: string;
}
