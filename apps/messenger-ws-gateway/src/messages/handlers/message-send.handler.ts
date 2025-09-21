import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_PRODUCER_TOKEN } from '@app/kafka';

interface AuthenticatedUser {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
export class MessageSendHandler {
  private readonly logger = new Logger(MessageSendHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(user: AuthenticatedUser, message: string): Promise<unknown> {
    console.log('MessageSendHandler called with user:', user);

    // forward message to Kafka
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: 'messenger.send',
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

      this.logger.log(`Message sent to Kafka: ${message}`);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send message to Kafka:', error);
      throw error;
    }
  }
}
