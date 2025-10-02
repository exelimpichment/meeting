import { KafkaTopic } from '@/apps/messenger/src/kafka/decorators/kafka-topic.decorator';
import { MessagesService } from '@/apps/messenger/src/messages/messages.service';
import { KAFKA_TOPICS } from '@/apps/messenger/src/kafka/topics.constants';
import { Controller, Logger } from '@nestjs/common';
import {
  KafkaDeleteMessageDto,
  KafkaEditMessageDto,
  KafkaSendMessageDto,
} from '@/libs/contracts/src/messenger/messenger.schema';

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  // kafka topic handlers
  @KafkaTopic(KAFKA_TOPICS.MESSAGE_SEND)
  async handleMessageSendFromKafka(payload: KafkaSendMessageDto) {
    this.logger.log(`Handling Kafka message send: ${JSON.stringify(payload)}`);
    // console.log('payload', payload);

    if (!payload.groupId) {
      this.logger.error('groupId is required for message send');
      return;
    }

    return await this.messagesService.sendMessage({
      userId: payload.userId,
      groupId: payload.groupId,
      message: payload.message,
    });
  }

  @KafkaTopic(KAFKA_TOPICS.MESSAGE_EDIT)
  async handleMessageEditFromKafka(payload: KafkaEditMessageDto) {
    this.logger.log(`Handling Kafka message edit: ${JSON.stringify(payload)}`);

    if (!payload.groupId || !payload.messageId) {
      this.logger.error('groupId and messageId are required for message edit');
      return;
    }

    return this.messagesService.editMessage({
      userId: payload.userId,
      groupId: payload.groupId,
      messageId: payload.messageId,
      message: payload.message,
    });
  }

  @KafkaTopic(KAFKA_TOPICS.MESSAGE_DELETE)
  async handleMessageDeleteFromKafka(payload: KafkaDeleteMessageDto) {
    this.logger.log(
      `Handling Kafka message delete: ${JSON.stringify(payload)}`,
    );

    if (!payload.groupId || !payload.messageId) {
      this.logger.error(
        'groupId and messageId are required for message delete',
      );
      return;
    }

    return this.messagesService.deleteMessage({
      userId: payload.userId,
      groupId: payload.groupId,
      messageId: payload.messageId,
    });
  }
}
