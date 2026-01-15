import { KAFKA_PRODUCER_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';
import { KAFKA_TOPICS } from '@/apps/messenger-ws-gateway/src/kafka/topics.constants';
import { DeleteMessageDto } from '@/libs/contracts/src/messenger/messenger.schema';
import { SupabaseAuthUser } from '@/libs/shared-authentication/src/types';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';

@Injectable()
export class MessageDeleteHandler {
  private readonly logger = new Logger(MessageDeleteHandler.name);

  constructor(
    @Inject(KAFKA_PRODUCER_TOKEN)
    private readonly producer: KafkaJS.Producer,
  ) {}

  async handle(
    user: SupabaseAuthUser,
    data: DeleteMessageDto,
  ): Promise<unknown> {
    console.log('MessageDeleteHandler called with user:', user);

    // forward message deletion to Kafka
    try {
      if (!this.producer) {
        throw new Error('Kafka producer is not available');
      }

      await this.producer.send({
        topic: KAFKA_TOPICS.MESSAGE_DELETE,
        messages: [
          {
            value: JSON.stringify({
              userId: user.sub,
              groupId: data.groupId,
              messageId: data.messageId,
              timestamp: new Date().toISOString(),
              source: 'websocket',
            }),
          },
        ],
      });

      this.logger.log(
        `Message deletion sent to Kafka for messageId: ${data.messageId}`,
      );
      return { success: true, message: 'Message deletion sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send delete message to Kafka:', error);
      throw error;
    }
  }
}
