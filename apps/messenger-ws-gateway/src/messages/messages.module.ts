import { ConversationSubscriptionsService } from '@/apps/messenger-ws-gateway/src/messages/conversation-subscriptions.service';
import { MessageDeleteHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-delete-handler';
import { MessageSendHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-send.handler';
import { MessageEditHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-edit.handler';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { MessagesGateway } from '@/apps/messenger-ws-gateway/src/messages/messages.gateway';
import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { NatsModule } from '@/apps/messenger-ws-gateway/src/nats/nats.module';
import { HashingModule } from '@app/hashing';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CustomConfigModule,
    HashingModule,
    SharedAuthenticationModule.forRoot(),
    NatsModule,
  ],
  providers: [
    MessagesGateway,
    MessageSendHandler,
    MessageEditHandler,
    MessageDeleteHandler,
    ConversationSubscriptionsService,
  ],
  exports: [MessagesGateway],
})
export class MessagesModule {}
