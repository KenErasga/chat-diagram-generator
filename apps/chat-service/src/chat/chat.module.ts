import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/history.module';
import { ProvidersModule } from '../providers/providers.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [HistoryModule, ProvidersModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
