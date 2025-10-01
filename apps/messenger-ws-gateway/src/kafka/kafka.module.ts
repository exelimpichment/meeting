import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { KafkaHealthIndicator } from './kafka.health-indicator';
import {
  DynamicModule,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
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
import { Logger } from '@nestjs/common';

// lifecycle manager for kafka connections
class KafkaLifecycleManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaLifecycleManager.name);

  constructor(
    private readonly producer?: KafkaJS.Producer,
    private readonly consumer?: KafkaJS.Consumer,
    private readonly adminClient?: KafkaJS.Admin,
  ) {}

  async onModuleInit() {
    try {
      if (this.producer) {
        this.logger.log('Connecting Kafka producer...');
        await this.producer.connect();
        this.logger.log('Kafka producer connected successfully');
      }
      if (this.consumer) {
        this.logger.log('Connecting Kafka consumer...');
        await this.consumer.connect();
        this.logger.log('Kafka consumer connected successfully');
      }
      if (this.adminClient) {
        this.logger.log('Connecting Kafka admin client...');
        await this.adminClient.connect();
        this.logger.log('Kafka admin client connected successfully');
      }
    } catch (error) {
      this.logger.error('Failed to connect Kafka clients:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.producer) {
        this.logger.log('Disconnecting Kafka producer...');
        await this.producer.disconnect();
        this.logger.log('Kafka producer disconnected');
      }
      if (this.consumer) {
        this.logger.log('Disconnecting Kafka consumer...');
        await this.consumer.disconnect();
        this.logger.log('Kafka consumer disconnected');
      }
      if (this.adminClient) {
        this.logger.log('Disconnecting Kafka admin client...');
        await this.adminClient.disconnect();
        this.logger.log('Kafka admin client disconnected');
      }
    } catch (error) {
      this.logger.error('Error disconnecting Kafka clients:', error);
    }
  }
}

@Module({})
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

  /**
   * Creates the connection to the kafka instance asynchronously with dependency injection.
   * @param options async options for kafka connection
   */
  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<KafkaConnectionOptions> | KafkaConnectionOptions;
    inject?: any[];
    global?: boolean;
  }): DynamicModule {
    const asyncProviders: Provider[] = [
      {
        provide: KAFKA_CONFIGURATION_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: KAFKA_PRODUCER_TOKEN,
        useFactory: (config: KafkaConnectionOptions) =>
          config.producer ? this.createProducer(config.producer) : undefined,
        inject: [KAFKA_CONFIGURATION_TOKEN],
      },
      {
        provide: KAFKA_CONSUMER_TOKEN,
        useFactory: (config: KafkaConnectionOptions) =>
          config.consumer ? this.createConsumer(config.consumer) : undefined,
        inject: [KAFKA_CONFIGURATION_TOKEN],
      },
      {
        provide: KAFKA_ADMIN_CLIENT_TOKEN,
        useFactory: (config: KafkaConnectionOptions) =>
          config.adminClient
            ? this.createAdminClient(config.adminClient)
            : undefined,
        inject: [KAFKA_CONFIGURATION_TOKEN],
      },
      {
        provide: KAFKA_METRICS_TOKEN,
        useFactory: (
          adminClient: KafkaJS.Admin | undefined,
          config: KafkaConnectionOptions,
          consumer: KafkaJS.Consumer | undefined,
        ) => new KafkaMetricsProvider(adminClient, config, consumer),
        inject: [
          KAFKA_ADMIN_CLIENT_TOKEN,
          KAFKA_CONFIGURATION_TOKEN,
          KAFKA_CONSUMER_TOKEN,
        ],
      },
      {
        provide: KafkaLifecycleManager,
        useFactory: (
          producer: KafkaJS.Producer | undefined,
          consumer: KafkaJS.Consumer | undefined,
          adminClient: KafkaJS.Admin | undefined,
        ) => new KafkaLifecycleManager(producer, consumer, adminClient),
        inject: [
          KAFKA_PRODUCER_TOKEN,
          KAFKA_CONSUMER_TOKEN,
          KAFKA_ADMIN_CLIENT_TOKEN,
        ],
      },
      {
        provide: KAFKA_HEALTH_INDICATOR_TOKEN,
        useFactory: (
          healthIndicatorService: HealthIndicatorService | undefined,
          adminClient: KafkaJS.Admin | undefined,
        ) => new KafkaHealthIndicator(healthIndicatorService, adminClient),
        inject: [
          { token: HealthIndicatorService, optional: true },
          KAFKA_ADMIN_CLIENT_TOKEN,
        ],
      },
    ];

    return {
      module: KafkaModule,
      imports: options.imports || [],
      providers: asyncProviders,
      exports: asyncProviders,
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
      {
        provide: KafkaLifecycleManager,
        useValue: new KafkaLifecycleManager(producer, consumer, adminClient),
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
