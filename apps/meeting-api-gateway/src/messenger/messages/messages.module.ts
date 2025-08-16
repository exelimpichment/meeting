import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [MessagesGateway],
  exports: [MessagesGateway],
})
export class MessagesModule {}
