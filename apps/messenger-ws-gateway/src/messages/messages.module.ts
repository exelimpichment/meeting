import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { MessageDeleteHandler } from './handlers/message-delete-handler';
import { MessageSendHandler } from './handlers/message-send.handler';
import { MessageEditHandler } from './handlers/message-edit.handler';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { MessagesGateway } from './messages.gateway';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CustomConfigModule,
    HashingModule,
    SharedAuthenticationModule.forRoot(),
  ],
  providers: [
    MessagesGateway,
    MessageSendHandler,
    MessageEditHandler,
    MessageDeleteHandler,
  ],
  exports: [MessagesGateway],
})
export class MessagesModule {}
