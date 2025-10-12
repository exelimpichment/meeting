import { ConversationsController } from '@/apps/meeting-api-gateway/src/conversations/conversations.controller';
import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { NatsModule } from '@/apps/meeting-api-gateway/src/nats/nats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NatsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
