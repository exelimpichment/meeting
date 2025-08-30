import { WsAuthService } from '@/libs/shared-authentication/src/services/ws-auth.service';
import { MessagesGateway } from './messages.gateway';
import { MessageSendHandler } from './handlers/message-send.handler';
import { MessageEditHandler } from './handlers/message-edit.handler';
import { MessageDeleteHandler } from './handlers/message-delete-handler';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { ConfigModule } from '@/libs/config/src/config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule, HashingModule, SharedAuthenticationModule],
  providers: [
    MessagesGateway,
    MessageSendHandler,
    MessageEditHandler,
    MessageDeleteHandler,
  ],
  exports: [MessagesGateway],
})
export class MessagesModule {}
