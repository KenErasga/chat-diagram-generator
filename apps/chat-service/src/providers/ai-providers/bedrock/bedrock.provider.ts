import { Injectable } from '@nestjs/common';
import { BaseBedrockProvider } from './base-bedrock.provider';
import { getBedrockModelId } from '../config';

const BEDROCK_SYSTEM_PROMPT = `You are a diagram generation assistant with expertise in Mermaid.js. IMPORTANT: Whenever the user's message involves creating, drawing, building, updating, extending, or modifying a diagram in any way, you MUST call the create_diagram tool — do not describe the diagram in text instead. Select the most appropriate diagram type (flowchart, sequenceDiagram, classDiagram, erDiagram, stateDiagram-v2, gantt, or pie) based on the user's request. When the conversation shows an existing diagram in a Mermaid code block, modify it as directed and return the full updated diagram definition. For all other messages, respond concisely with plain text.`;

@Injectable()
export class BedrockProvider extends BaseBedrockProvider {
  protected readonly modelId = getBedrockModelId();
  protected readonly loggerContext = 'BedrockProvider';
  protected readonly systemPrompt = BEDROCK_SYSTEM_PROMPT;
}
