import { Module } from '@nestjs/common';
import { HISTORY_ADAPTER } from './history.adapter.interface';
import { InMemoryHistoryAdapter } from './in-memory-history.adapter';

@Module({
  providers: [{ provide: HISTORY_ADAPTER, useClass: InMemoryHistoryAdapter }],
  exports: [HISTORY_ADAPTER]
})
export class HistoryModule {}
