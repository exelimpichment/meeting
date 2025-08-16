import { MessagesController } from '@apps/meeting-api-gateway/src/messenger/conversations/messages/messages.controller';
import { NatsModule } from '@apps/meeting-api-gateway/src/nats/nats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NatsModule],
  controllers: [MessagesController],
})
export class MessagesModule {}
