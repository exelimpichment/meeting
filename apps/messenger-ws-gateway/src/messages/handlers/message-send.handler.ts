import { KAFKA_PRODUCER_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';
import { KAFKA_TOPICS } from '@/apps/messenger-ws-gateway/src/kafka/topics.constants';
import { SupabaseAuthUser } from '@/libs/shared-authentication/src/types';
import { SendMessageDto } from '@/libs/contracts/src/messenger/messenger.schema';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';

@Injectable()
export class MessageSendHandler {
  private readonly logger = new Logger(MessageSendHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(user: SupabaseAuthUser, data: SendMessageDto): Promise<unknown> {
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: KAFKA_TOPICS.MESSAGE_SEND,
        messages: [
          {
            value: JSON.stringify({
              userId: user.sub,
              groupId: data.groupId,
              message: data.message,
              timestamp: new Date().toISOString(),
              source: 'websocket',
            }),
          },
        ],
      });

      this.logger.log(`Message sent to Kafka: ${data.message}`);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send message to Kafka:', error);
      throw error;
    }
  }
}
