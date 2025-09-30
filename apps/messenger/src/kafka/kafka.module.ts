import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { KafkaHealthIndicator } from './kafka.health-indicator';
import { DynamicModule, Provider } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KafkaMetricsProvider } from './kafka.metrics';
import {
  KafkaAdminClientOptions,
  KafkaConnectionOptions,
  KafkaConsumerOptions,
  KafkaProducerOptions,
  KafkaSchemaRegistryClientOptions,
} from './kafka.options';
import {
  KAFKA_ADMIN_CLIENT_TOKEN,
  KAFKA_CONFIGURATION_TOKEN,
  KAFKA_HEALTH_INDICATOR_TOKEN,
  KAFKA_METRICS_TOKEN,
  KAFKA_CONSUMER_TOKEN,
  KAFKA_PRODUCER_TOKEN,
} from './constants';

//TODO: add disconnect on module destroy
export class KafkaModule {
  /**
   * Creates the connection to the kafka instance.
   * @param options the options for the node-rdkafka connection.
   * @internal
   */

  static forRoot(options: KafkaConnectionOptions): DynamicModule {
    const providers = this.getKafkaConnectionProviderList(options);
    return {
      module: KafkaModule,
      providers: providers,
      exports: providers,
      global: options.global ?? true,
    };
  }

  private static getKafkaConnectionProviderList(
    options: KafkaConnectionOptions,
  ): Provider[] {
    const adminClient: KafkaJS.Admin | undefined =
      options.adminClient && this.createAdminClient(options.adminClient);
    const consumer: KafkaJS.Consumer | undefined =
      options.consumer && this.createConsumer(options.consumer);
    const producer: KafkaJS.Producer | undefined =
      options.producer && this.createProducer(options.producer);
    // const schemaRegistry: SchemaRegistryClient | undefined =
    //   options.schemaRegistry &&
    //   this.createSchemaRegistry(options.schemaRegistry);

    const providers: Provider[] = [
      { provide: KAFKA_CONFIGURATION_TOKEN, useValue: options },
      { provide: KAFKA_ADMIN_CLIENT_TOKEN, useValue: adminClient },
      { provide: KAFKA_CONSUMER_TOKEN, useValue: consumer },
      { provide: KAFKA_PRODUCER_TOKEN, useValue: producer },
      // { provide: KAFKA_SCHEMA_REGISTRY_TOKEN, useValue: schemaRegistry },
      {
        provide: KAFKA_METRICS_TOKEN,
        useValue: new KafkaMetricsProvider(adminClient, options, consumer),
      },
    ];

    providers.push({
      provide: KAFKA_HEALTH_INDICATOR_TOKEN,
      useFactory: (healthIndicatorService?: HealthIndicatorService) => {
        return new KafkaHealthIndicator(healthIndicatorService, adminClient);
      },
      inject: [{ token: HealthIndicatorService, optional: true }],
    });

    return providers;
  }

  private static createConsumer(
    consumerOptions: KafkaConsumerOptions,
  ): KafkaJS.Consumer {
    const consumer = new KafkaJS.Kafka({}).consumer(consumerOptions.conf);

    return consumer;
  }

  private static createProducer(
    producerOptions: KafkaProducerOptions,
  ): KafkaJS.Producer {
    const producer = new KafkaJS.Kafka({}).producer(producerOptions.conf);
    return producer;
  }

  private static createAdminClient(
    options: KafkaAdminClientOptions,
  ): KafkaJS.Admin {
    return new KafkaJS.Kafka({}).admin(options.conf);
  }

  private static createSchemaRegistry(
    options: KafkaSchemaRegistryClientOptions,
  ): SchemaRegistryClient {
    return new SchemaRegistryClient(options.conf);
  }
}
