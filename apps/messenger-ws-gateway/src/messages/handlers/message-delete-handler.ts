import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_PRODUCER_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';

interface AuthenticatedUser {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
export class MessageDeleteHandler {
  private readonly logger = new Logger(MessageDeleteHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(user: AuthenticatedUser, message: string): Promise<unknown> {
    console.log('MessageDeleteHandler called with user:', user);

    // forward message deletion to Kafka
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: 'messenger-ws.message-events',
        messages: [
          {
            value: JSON.stringify({
              userId: user.sub,
              message,
              timestamp: new Date().toISOString(),
              source: 'websocket',
            }),
          },
        ],
      });

      this.logger.log(`Message deletion sent to Kafka: ${message}`);
      return { success: true, message: 'Message deletion sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send delete message to Kafka:', error);
      throw error;
    }
  }
}
