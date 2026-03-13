import { Logger } from '@nestjs/common';
import type { IModelProvider } from '../model-provider.interface';
import { AnthropicStub } from './stubs/anthropic.stub';
import { BedrockProvider } from './bedrock/bedrock.provider';
import { DefaultStub } from './stubs/default.stub';
import { OpenAIStub } from './stubs/openai.stub';

const logger = new Logger('ProviderFactory');

/** Plain factory used as useFactory in ProvidersModule. Not injectable directly. */
export function providerFactory(): IModelProvider {
  const provider = process.env.MODEL_PROVIDER;

  if (provider === 'bedrock') {
    logger.log('Using BedrockProvider (Amazon Nova on Bedrock)');

    return new BedrockProvider();
  }

  if (provider === 'openai') {
    logger.log('Using OpenAI stub');

    return new OpenAIStub();
  }

  if (provider === 'anthropic') {
    // Update to use Bedrock (Amazon Claude on Bedrock)
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
