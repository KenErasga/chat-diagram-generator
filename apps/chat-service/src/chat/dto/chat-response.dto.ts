export class ChatResponseDto {
  type!: 'diagram' | 'message';
  content!: string;
  diagram?: string;
}
