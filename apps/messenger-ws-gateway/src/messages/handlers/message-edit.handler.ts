import { MessageEditDto } from '@/apps/messenger-ws-gateway/src/messages/dto/message-edit.dto';
import { KAFKA_PRODUCER_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';
import { KAFKA_TOPICS } from '@/apps/messenger-ws-gateway/src/kafka/topics.constants';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';

@Injectable()
export class MessageEditHandler {
  private readonly logger = new Logger(MessageEditHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(user: JwtPayload, data: MessageEditDto): Promise<unknown> {
    console.log('MessageEditHandler called with user:', user);

    // forward message edit to Kafka
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: KAFKA_TOPICS.MESSAGE_EDIT,
        messages: [
          {
            value: JSON.stringify({
              userId: user.sub,
              groupId: data.groupId,
              messageId: data.messageId,
              message: data.message,
              timestamp: new Date().toISOString(),
              source: 'websocket',
            }),
          },
        ],
      });

      this.logger.log(`Message edit sent to Kafka: ${data.message}`);
      return { success: true, message: 'Message edit sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send edit message to Kafka:', error);
      throw error;
    }
  }
}
