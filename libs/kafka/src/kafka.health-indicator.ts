import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { KAFKA_ADMIN_CLIENT_TOKEN } from './constants';

export class KafkaHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(KAFKA_ADMIN_CLIENT_TOKEN)
    private readonly adminClient?: KafkaJS.Admin,
  ) {
    super();
  }

  async isHealthy(key: string = 'kafka'): Promise<HealthIndicatorResult> {
    if (!this.adminClient) {
      throw new Error(
        "Kafka admin client not provided. Did you forget to provide 'adminClient' configuration in KafkaModule?",
      );
    }

    try {
      await this.adminClient.fetchTopicMetadata();
      return this.getStatus(key, true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus(key, false, { message: errorMessage });
    }
  }
}
