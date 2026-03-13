import { Module } from '@nestjs/common';
import { IN_MEMORY_DB_ADAPTER } from './in-memory-db.adapter.interface';
import { InMemoryDbAdapter } from './in-memory-db.adapter';

@Module({
  providers: [{ provide: IN_MEMORY_DB_ADAPTER, useClass: InMemoryDbAdapter }],
  exports: [IN_MEMORY_DB_ADAPTER]
})
export class InMemoryDbModule {}
