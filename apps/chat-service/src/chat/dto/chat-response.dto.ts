import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ enum: ['diagram', 'message'] })
  type!: 'diagram' | 'message';

  @ApiProperty({ description: 'Human-readable assistant response' })
  content!: string;

  @ApiProperty({ description: 'Mermaid diagram definition', required: false })
  diagram?: string;
}
