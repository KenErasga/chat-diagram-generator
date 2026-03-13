import type { IModelProvider } from './model-provider.interface';
import { AnthropicStub } from './stubs/anthropic.stub';
import { DefaultStub } from './stubs/default.stub';
import { OpenAIStub } from './stubs/openai.stub';

export function providerFactory(): IModelProvider {
  const provider = process.env.MODEL_PROVIDER;

  if (provider === 'openai') {
    return new OpenAIStub();
  }

  if (provider === 'anthropic') {
    return new AnthropicStub();
  }

  return new DefaultStub();
}
