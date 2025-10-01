import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessengerPrismaModule } from '../prisma/messenger-prisma.module';

@Module({
  imports: [MessengerPrismaModule, DiscoveryModule],
  controllers: [MessagesController],
  providers: [MessagesService, KafkaConsumerService],
  exports: [MessagesService],
})
export class MessagesModule {}
