import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Inject } from '@nestjs/common';
import {
  KAFKA_ADMIN_CLIENT_TOKEN,
  KAFKA_CONFIGURATION_TOKEN,
  KAFKA_CONSUMER_TOKEN,
} from './constants';
import { KafkaConnectionOptions } from './kafka.options';

export interface KafkaMetrics {
  lag?: number;
  consumerOffset?: number;
  producerOffset?: number;
}

export class KafkaMetricsProvider {
  constructor(
    @Inject(KAFKA_ADMIN_CLIENT_TOKEN) private readonly admin?: KafkaJS.Admin,
    @Inject(KAFKA_CONFIGURATION_TOKEN)
    private readonly config?: KafkaConnectionOptions,
    @Inject(KAFKA_CONSUMER_TOKEN)
    private readonly consumer?: KafkaJS.Consumer,
  ) {}

  private checkPrerequisites(): void {
    const consumerGroupId = this.config?.consumer?.conf['group.id'];

    if (!consumerGroupId) {
      throw new Error(
        "Consumer group id not provided. Did you forget to provide 'group.id' in consumer configuration?",
      );
    }
    if (!this.admin) {
      throw new Error(
        "Admin client not provided. Did you forget to provide 'adminClient' configuration in KafkaModule?",
      );
    }
    if (!this.consumer) {
      throw new Error(
        "Consumer not provided. Did you forget to provide 'consumer' configuration in KafkaModule?",
      );
    }
  }

  async getMetrics(): Promise<Record<string, KafkaMetrics>> {
    this.checkPrerequisites();

    const consumerGroupId = this.config!.consumer!.conf['group.id']!;

    let topics: string[];
    try {
      topics = (await this.admin!.fetchTopicMetadata()).topics.map(
        (topic) => topic.name,
      );
    } catch (e) {
      topics = this.consumer?.assignment()?.map((topic) => topic.topic) ?? [];
    }

    const topicMetrics: Record<string, KafkaMetrics> = {};

    for (const topic of topics) {
      // fetch producer offsets
      const producerOffset = await this.admin!.fetchTopicOffsets(topic);

      // fetch consumer offsets for the consumer group
      const consumerOffsets = await this.admin!.fetchOffsets({
        groupId: consumerGroupId,
        topics: [topic],
      });

      // find the max offset for each partition
      consumerOffsets.forEach((offset) => {
        topicMetrics[offset.topic] = {
          consumerOffset: offset.partitions.reduce(
            (prev, curr) => Math.max(prev, Number.parseInt(curr.offset)),
            0,
          ),
        };
      });

      producerOffset.forEach((offset) => {
        topicMetrics[topic].producerOffset = Number.parseInt(offset.offset);
      });
    }

    Object.keys(topicMetrics).forEach((topic) => {
      topicMetrics[topic].lag =
        (topicMetrics[topic].producerOffset ?? 0) -
        (topicMetrics[topic].consumerOffset ?? 0);
    });

    return topicMetrics;
  }
}
