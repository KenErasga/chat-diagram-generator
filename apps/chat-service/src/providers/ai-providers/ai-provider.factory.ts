import { Logger } from '@nestjs/common';
import type { IModelProvider } from '../model-provider.interface';
import { AnthropicStub } from './anthropic.stub';
import { BedrockProvider } from './bedrock.provider';
import { DefaultStub } from './default.stub';
import { OpenAIStub } from './openai.stub';

const logger = new Logger('ProviderFactory');

/** Plain factory used as useFactory in ProvidersModule. Not injectable directly. */
export function providerFactory(): IModelProvider {
  const provider = process.env.MODEL_PROVIDER;

  if (provider === 'nova') {
    logger.log('Using BedrockProvider (Amazon Nova on Bedrock)');

    return new BedrockProvider();
  }

  if (provider === 'openai') {
    logger.log('Using OpenAI stub');

    return new OpenAIStub();
  }

  if (provider === 'anthropic') {
    logger.log('Using Anthropic stub');

    return new AnthropicStub();
  }

  if (provider !== undefined) {
    logger.warn(`Unknown MODEL_PROVIDER "${provider}", using default stub`);
  } else {
    logger.log('Using default stub');
  }

  return new DefaultStub();
}
