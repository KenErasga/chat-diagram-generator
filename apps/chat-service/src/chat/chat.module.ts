import { Module } from '@nestjs/common';
import { InMemoryDbModule } from '../providers/db-providers/in-memory-db/in-memory-db.module';
import { ProvidersModule } from '../providers/providers.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [InMemoryDbModule, ProvidersModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
