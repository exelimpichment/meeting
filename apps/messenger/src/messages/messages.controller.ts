import { DeleteMessageDto } from '@/libs/contracts/src/messenger/delete-message-dto';
import { SendMessageDto } from '@/libs/contracts/src/messenger/send-message-dto';
import { EditMessageDto } from '@/libs/contracts/src/messenger/edit-message-dto';
import { KafkaTopic } from '../kafka/decorators/kafka-topic.decorator';
import { MessagesService } from './messages.service';
import { Controller, Logger } from '@nestjs/common';
import { KAFKA_TOPICS } from '../kafka/topics.constants';

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  // kafka topic handlers
  @KafkaTopic(KAFKA_TOPICS.MESSAGE_SEND)
  async handleMessageSendFromKafka(
    payload: SendMessageDto & { timestamp?: string; source?: string },
  ) {
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
  async handleMessageEditFromKafka(
    payload: EditMessageDto & { timestamp?: string; source?: string },
  ) {
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
  async handleMessageDeleteFromKafka(
    payload: DeleteMessageDto & { timestamp?: string; source?: string },
  ) {
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
