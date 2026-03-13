const mockSend = jest.fn();

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  ConverseCommand: jest.fn().mockImplementation((input: unknown) => input)
}));

import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockProvider } from './bedrock.provider';
import { makeToolUseResponse, makeTextResponse } from './bedrock-test-fixtures';
import type { Turn } from '../db-providers/in-memory-db/turn.type';

describe('BedrockProvider', () => {
  let provider: BedrockProvider;

  beforeEach(() => {
    mockSend.mockReset();
    jest.clearAllMocks();
    provider = new BedrockProvider();
  });

  it('returns a diagram response when the model returns a tool_use stop reason', async () => {
    const mermaid = 'flowchart TD\n  A --> B';
    const explanation = 'A simple flowchart from A to B.';

    mockSend.mockResolvedValueOnce(makeToolUseResponse('flowchart', mermaid, explanation));

    const result = await provider.chat([], 'Create a flowchart');

    expect(result.type).toBe('diagram');
    expect(result.diagram).toContain('flowchart TD');
    expect(result.content).toBe(explanation);
  });

  it('returns a message response when the model returns a text block', async () => {
    const text = 'Hello from Bedrock!';

    mockSend.mockResolvedValueOnce(makeTextResponse(text));

    const result = await provider.chat([], 'What can you do?');

    expect(result.type).toBe('message');
    expect(result.content).toBe(text);
  });

  it('includes prior diagram in the assistant turn passed to ConverseCommand', async () => {
    mockSend.mockResolvedValueOnce(makeTextResponse('Updated.'));

    const mermaidDef = 'flowchart TD\n  X --> Y';
    const history: Turn[] = [
      { role: 'user', content: 'Create a chart' },
      { role: 'assistant', content: 'Here is your diagram.', diagram: mermaidDef }
    ];

    await provider.chat(history, 'Add a third node');

    const callArg = (ConverseCommand as unknown as jest.Mock).mock.calls[0][0] as {
      messages: Array<{ role: string; content: Array<{ text?: string }> }>;
    };
    const assistantTurn = callArg.messages.find(m => m.role === 'assistant');

    expect(assistantTurn).toBeDefined();
    expect(assistantTurn?.content[0].text).toContain('```mermaid');
    expect(assistantTurn?.content[0].text).toContain(mermaidDef);
  });

  it('uses the default Bedrock model ID when BEDROCK_MODEL_ID is not set', async () => {
    delete process.env.BEDROCK_MODEL_ID;
    mockSend.mockResolvedValueOnce(makeTextResponse('ok'));

    await provider.chat([], 'Hello');

    const callArg = (ConverseCommand as unknown as jest.Mock).mock.calls[0][0] as {
      modelId: string;
    };

    expect(callArg.modelId).toBe('amazon.nova-pro-v1:0');
  });

  it('propagates SDK errors to the caller', async () => {
    const sdkError = new Error('SDK failure');

    mockSend.mockRejectedValueOnce(sdkError);

    await expect(provider.chat([], 'Hello')).rejects.toThrow('SDK failure');
  });
});
