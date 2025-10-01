import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_CONSUMER_TOKEN } from './constants';
import { KAFKA_TOPICS } from './topics.constants';
import { MessagesService } from '../messages/messages.service';

interface MessageEventPayload {
  userId: string;
  message: string;
  messageId?: string;
  groupId?: string;
  timestamp: string;
  source: string;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    @Inject(KAFKA_CONSUMER_TOKEN)
    private readonly consumer: KafkaJS.Consumer,
    private readonly messagesService: MessagesService,
  ) {}

  async onModuleInit() {
    if (!this.consumer) {
      this.logger.warn('Kafka consumer not configured, skipping subscription');
      return;
    }

    try {
      // subscribe to all message topics
      await this.consumer.subscribe({
        topics: [
          KAFKA_TOPICS.MESSAGE_SEND,
          KAFKA_TOPICS.MESSAGE_EDIT,
          KAFKA_TOPICS.MESSAGE_DELETE,
        ],
      });

      this.logger.log('Subscribed to Kafka topics successfully');

      // start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload: MessageEventPayload = JSON.parse(
              message.value?.toString() || '{}',
            );

            this.logger.log(
              `Received message from topic ${topic}, partition ${partition}`,
            );

            // route to appropriate handler based on topic
            switch (topic) {
              case KAFKA_TOPICS.MESSAGE_SEND:
                await this.handleMessageSend(payload);
                break;
              case KAFKA_TOPICS.MESSAGE_EDIT:
                await this.handleMessageEdit(payload);
                break;
              case KAFKA_TOPICS.MESSAGE_DELETE:
                await this.handleMessageDelete(payload);
                break;
              default:
                this.logger.warn(`Unknown topic: ${topic}`);
            }
          } catch (error) {
            this.logger.error(
              `Error processing message from topic ${topic}:`,
              error,
            );
            // implement dead letter queue or retry logic here if needed
          }
        },
      });

      this.logger.log('Kafka consumer is running');
    } catch (error) {
      this.logger.error('Failed to start Kafka consumer:', error);
      throw error;
    }
  }

  private async handleMessageSend(payload: MessageEventPayload) {
    this.logger.log(`Handling message send: ${JSON.stringify(payload)}`);

    if (!payload.groupId) {
      this.logger.error('groupId is required for message send');
      return;
    }

    await this.messagesService.sendMessage({
      userId: payload.userId,
      message: payload.message,
      groupId: payload.groupId,
    });
  }

  private async handleMessageEdit(payload: MessageEventPayload) {
    this.logger.log(`Handling message edit: ${JSON.stringify(payload)}`);

    if (!payload.groupId || !payload.messageId) {
      this.logger.error('groupId and messageId are required for message edit');
      return;
    }

    await this.messagesService.editMessage({
      userId: payload.userId,
      message: payload.message,
      groupId: payload.groupId,
      messageId: payload.messageId,
    });
  }

  private async handleMessageDelete(payload: MessageEventPayload) {
    this.logger.log(`Handling message delete: ${JSON.stringify(payload)}`);

    if (!payload.groupId || !payload.messageId) {
      this.logger.error(
        'groupId and messageId are required for message delete',
      );
      return;
    }

    await this.messagesService.deleteMessage({
      userId: payload.userId,
      groupId: payload.groupId,
      messageId: payload.messageId,
    });
  }
}
