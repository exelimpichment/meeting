import { Module } from '@nestjs/common';
// import { ClientsModule, Transport } from '@nestjs/microservices'; // Removed
import { MessengerGateway } from './messenger.gateway';
import { KafkaModule } from '../kafka/kafka.module'; // Added KafkaModule import

@Module({
  imports: [KafkaModule],
  providers: [MessengerGateway],
  exports: [MessengerGateway],
})
export class MessengerModule {}
