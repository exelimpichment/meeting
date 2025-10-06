import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { MessageDeleteHandler } from './handlers/message-delete-handler';
import { MessageSendHandler } from './handlers/message-send.handler';
import { MessageEditHandler } from './handlers/message-edit.handler';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { MessagesGateway } from './messages.gateway';
import { Module } from '@nestjs/common';
import { NatsModule } from '@/apps/messenger-ws-gateway/src/nats/nats.module';
import { ConversationSubscriptionsService } from '@/apps/messenger-ws-gateway/src/messages/conversation-subscriptions.service';

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
