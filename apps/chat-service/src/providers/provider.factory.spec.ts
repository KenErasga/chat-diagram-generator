import { providerFactory } from './provider.factory';
import { AnthropicStub } from './stubs/anthropic.stub';
import { DefaultStub } from './stubs/default.stub';
import { OpenAIStub } from './stubs/openai.stub';

describe('providerFactory', () => {
  afterEach(() => {
    delete process.env.MODEL_PROVIDER;
  });

  it('returns OpenAIStub when MODEL_PROVIDER=openai', () => {
    process.env.MODEL_PROVIDER = 'openai';

    expect(providerFactory()).toBeInstanceOf(OpenAIStub);
  });

  it('returns AnthropicStub when MODEL_PROVIDER=anthropic', () => {
    process.env.MODEL_PROVIDER = 'anthropic';

    expect(providerFactory()).toBeInstanceOf(AnthropicStub);
  });

  it('returns DefaultStub when MODEL_PROVIDER is unset', () => {
    expect(providerFactory()).toBeInstanceOf(DefaultStub);
  });

  it('returns DefaultStub for unknown provider values', () => {
    process.env.MODEL_PROVIDER = 'unknown';

    expect(providerFactory()).toBeInstanceOf(DefaultStub);
  });
});
