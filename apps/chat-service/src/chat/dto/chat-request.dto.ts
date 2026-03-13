import { IsNotEmpty, IsString } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
