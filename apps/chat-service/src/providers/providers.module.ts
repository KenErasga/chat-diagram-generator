import { Module } from '@nestjs/common';
import { MODEL_PROVIDER_TOKEN } from './model-provider.interface';
import { providerFactory } from './provider.factory';

@Module({
  providers: [{ provide: MODEL_PROVIDER_TOKEN, useFactory: providerFactory }],
  exports: [MODEL_PROVIDER_TOKEN]
})
export class ProvidersModule {}
