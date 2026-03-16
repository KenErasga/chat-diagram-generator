import { Logger } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseResponse,
  type Message as BedrockMessage,
  type ToolConfiguration
} from '@aws-sdk/client-bedrock-runtime';
import type { ChatResponseDto } from '../../../chat/dto/chat-response.dto';
import type { IModelProvider } from '../../model-provider.interface';
import type { Message } from '../../db-providers/in-memory-db/message.type';
import { getAwsRegion } from '../config';

const MAX_TOKENS = 4096;

const KNOWN_DIAGRAM_TYPES = [
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'erDiagram',
  'stateDiagram-v2',
  'gantt',
  'pie'
] as const;

function extractDiagramType(mermaid: string): string {
  const firstLine = mermaid.trim().split('\n')[0];

  return KNOWN_DIAGRAM_TYPES.find(t => firstLine.startsWith(t)) ?? 'flowchart';
}

const CREATE_DIAGRAM_TOOL_CONFIG: ToolConfiguration = {
  tools: [
    {
      toolSpec: {
        name: 'create_diagram',
        description: 'Create or update a Mermaid diagram based on the user request.',
        inputSchema: {
          json: {
            type: 'object',
            properties: {
              diagram_type: {
                type: 'string',
                enum: ['flowchart', 'sequenceDiagram', 'classDiagram', 'erDiagram', 'stateDiagram-v2', 'gantt', 'pie'],
                description: 'The Mermaid diagram type to generate.'
              },
              mermaid_definition: {
                type: 'string',
                description: 'The full Mermaid diagram definition.'
              },
              explanation: {
                type: 'string',
                description: 'A human-readable explanation of the diagram.'
              }
            },
            required: ['diagram_type', 'mermaid_definition', 'explanation']
          }
        }
      }
    }
  ]
};

export abstract class BaseBedrockProvider implements IModelProvider {
  protected abstract readonly modelId: string;
  protected abstract readonly loggerContext: string;
  protected abstract readonly systemPrompt: string;

  private readonly client: BedrockRuntimeClient;
  private _logger: Logger | undefined;

  private get logger(): Logger {
    if (this._logger === undefined) {
      this._logger = new Logger(this.loggerContext);
    }

    return this._logger;
  }

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: getAwsRegion()
    });
  }

  async chat(history: Message[], message: string): Promise<ChatResponseDto> {
    this.logger.log(`chat called — modelId=${this.modelId}, historyLength=${history.length}`);

    const bedrockMessages = this.mapHistoryToBedrockMessages(history, message);

    let response: ConverseResponse;

    try {
      response = await this.client.send(
        new ConverseCommand({
          modelId: this.modelId,
          system: [{ text: this.systemPrompt }],
          messages: bedrockMessages,
          toolConfig: CREATE_DIAGRAM_TOOL_CONFIG,
          inferenceConfig: { maxTokens: MAX_TOKENS }
        })
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`ConverseCommand failed: ${err.message}`, err.stack);
      } else {
        this.logger.error('ConverseCommand failed with non-Error value', String(err));
      }

      throw err;
    }

    const result = this.parseResponse(response);

    this.logger.log(`Response type: ${result.type}`);

    return result;
  }

  private mapHistoryToBedrockMessages(history: Message[], newMessage: string): BedrockMessage[] {
    const bedrockMessages: BedrockMessage[] = [];

    for (let i = 0; i < history.length; i++) {
      const msg = history[i];

      if (msg.role === 'user') {
        bedrockMessages.push({ role: 'user', content: [{ text: msg.content }] });
        continue;
      }

      if (msg.diagram !== undefined) {
        const toolUseId = `tu-${i}`;

        bedrockMessages.push({
          role: 'assistant',
          content: [
            {
              toolUse: {
                toolUseId,
                name: 'create_diagram',
                input: {
                  diagram_type: extractDiagramType(msg.diagram),
                  mermaid_definition: msg.diagram,
                  explanation: msg.content
                }
              }
            }
          ]
        });

        bedrockMessages.push({
          role: 'user',
          content: [
            {
              toolResult: {
                toolUseId,
                content: [{ text: 'Diagram created successfully.' }],
                status: 'success'
              }
            }
          ]
        });

        continue;
      }

      bedrockMessages.push({ role: 'assistant', content: [{ text: msg.content }] });
    }

    bedrockMessages.push({ role: 'user', content: [{ text: newMessage }] });

    return bedrockMessages;
  }

  private parseResponse(response: ConverseResponse): ChatResponseDto {
    if (response.stopReason === 'tool_use') {
      const outputContent = response.output?.message?.content ?? [];
      const toolBlock = outputContent.find(block => 'toolUse' in block && block.toolUse?.name === 'create_diagram');

      if (toolBlock !== undefined && 'toolUse' in toolBlock && toolBlock.toolUse !== undefined) {
        const input = toolBlock.toolUse.input as Record<string, unknown>;

        return {
          type: 'diagram',
          content: input.explanation as string,
          diagram: input.mermaid_definition as string
        };
      }
    }

    const outputContent = response.output?.message?.content ?? [];
    const textBlock = outputContent.find(block => 'text' in block);

    if (textBlock !== undefined && 'text' in textBlock && textBlock.text !== undefined) {
      return { type: 'message', content: textBlock.text };
    }

    this.logger.warn('No recognizable content block in ConverseResponse — returning fallback');

    return { type: 'message', content: 'No response generated.' };
  }
}
