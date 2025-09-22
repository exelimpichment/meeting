import { KAFKA_PRODUCER_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';

interface AuthenticatedUser {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
export class MessageEditHandler {
  private readonly logger = new Logger(MessageEditHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(user: AuthenticatedUser, message: string): Promise<unknown> {
    console.log('MessageEditHandler called with user:', user);

    // forward message edit to Kafka
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: 'messenger.edit',
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

      this.logger.log(`Message edit sent to Kafka: ${message}`);
      return { success: true, message: 'Message edit sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send edit message to Kafka:', error);
      throw error;
    }
  }
}
