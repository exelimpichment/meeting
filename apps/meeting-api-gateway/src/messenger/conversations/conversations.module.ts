import { ConversationsController } from '@/apps/meeting-api-gateway/src/messenger/conversations/conversations.controller';
import { MessagesModule } from '@/apps/meeting-api-gateway/src/messenger/conversations/messages/messages.module';
import { NatsModule } from '@/apps/meeting-api-gateway/src/nats/nats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NatsModule, MessagesModule],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
