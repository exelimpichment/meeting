import { KAFKA_ADMIN_CLIENT_TOKEN } from '@/apps/messenger-ws-gateway/src/kafka/constants';
import { ITopicConfig } from '@confluentinc/kafka-javascript/types/kafkajs';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_TOPICS } from './topics.constants';

@Injectable()
export class TopicManagementService implements OnModuleInit {
  private readonly logger = new Logger(TopicManagementService.name);

  constructor(
    @Inject(KAFKA_ADMIN_CLIENT_TOKEN)
    private readonly adminClient: KafkaJS.Admin | undefined,
  ) {}

  async onModuleInit() {
    if (!this.adminClient) {
      this.logger.warn('Admin client not available, skipping topic creation');
      return;
    }

    await this.ensureTopicsExist(
      Object.values(KAFKA_TOPICS).map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    );
  }

  private async ensureTopicsExist(topicConfigs: ITopicConfig[]) {
    if (!this.adminClient) {
      return;
    }

    try {
      this.logger.log('Checking existing topics...');
      const existingTopics = await this.adminClient.listTopics();
      this.logger.log(
        `Found ${existingTopics.length} existing topics, namely: ${existingTopics.join(', ')}`,
      );

      const topicsToCreate = topicConfigs.filter(
        (config) => !existingTopics.includes(config.topic),
      );

      if (topicsToCreate.length > 0) {
        this.logger.log(
          `Creating ${topicsToCreate.length} new topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`,
        );

        await this.adminClient.createTopics({
          topics: topicsToCreate.map((config) => ({
            topic: config.topic,
            numPartitions: config.numPartitions,
            replicationFactor: config.replicationFactor,
            configEntries: config.configEntries,
          })),
        });

        this.logger.log(
          `Successfully created topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`,
        );
      } else {
        this.logger.log('All required topics already exist');
      }
    } catch (error) {
      this.logger.error('Error managing topics:', error);
      throw error;
    }
  }
}
