import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [KafkaModule, MessagesModule, ConversationsModule],
  exports: [],
})
export class MessengerModule {}
