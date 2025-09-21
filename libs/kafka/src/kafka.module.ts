import { KafkaJS } from '@confluentinc/kafka-javascript';
// import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { DynamicModule, Provider } from '@nestjs/common';
import {
  KafkaAdminClientOptions,
  KafkaConnectionOptions,
  KafkaConnectionAsyncOptions,
  KafkaConsumerOptions,
  KafkaProducerOptions,
  // KafkaSchemaRegistryClientOptions,
} from './kafka.options';
import {
  KAFKA_ADMIN_CLIENT_TOKEN,
  KAFKA_PRODUCER_TOKEN,
  KAFKA_CONSUMER_TOKEN,
  // KAFKA_SCHEMA_REGISTRY_TOKEN,
  KAFKA_CONFIGURATION_TOKEN,
} from './constants';

export class KafkaModule {
  /**
   * creates the connection to the kafka instance.
   * @param options the options for the kafka connection.
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
   * creates async connection to the kafka instance.
   * @param options the async options for the kafka connection.
   */
  static forRootAsync(options: KafkaConnectionAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'KAFKA_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: KAFKA_ADMIN_CLIENT_TOKEN,
          useFactory: (moduleOptions: KafkaConnectionOptions) =>
            moduleOptions.adminClient &&
            this.createAdminClient(moduleOptions.adminClient),
          inject: ['KAFKA_MODULE_OPTIONS'],
        },
        {
          provide: KAFKA_CONSUMER_TOKEN,
          useFactory: (moduleOptions: KafkaConnectionOptions) =>
            moduleOptions.consumer &&
            this.createConsumer(moduleOptions.consumer),
          inject: ['KAFKA_MODULE_OPTIONS'],
        },
        {
          provide: KAFKA_PRODUCER_TOKEN,
          useFactory: (moduleOptions: KafkaConnectionOptions) =>
            moduleOptions.producer &&
            this.createProducer(moduleOptions.producer),
          inject: ['KAFKA_MODULE_OPTIONS'],
        },
        // {
        //   provide: KAFKA_SCHEMA_REGISTRY_TOKEN,
        //   useFactory: (moduleOptions: KafkaConnectionOptions) =>
        //     moduleOptions.schemaRegistry &&
        //     this.createSchemaRegistry(moduleOptions.schemaRegistry),
        //   inject: ['KAFKA_MODULE_OPTIONS'],
        // },
        {
          provide: KAFKA_CONFIGURATION_TOKEN,
          useFactory: (moduleOptions: KafkaConnectionOptions) => moduleOptions,
          inject: ['KAFKA_MODULE_OPTIONS'],
        },
      ],
      exports: [
        KAFKA_ADMIN_CLIENT_TOKEN,
        KAFKA_CONSUMER_TOKEN,
        KAFKA_PRODUCER_TOKEN,
        // KAFKA_SCHEMA_REGISTRY_TOKEN,
        KAFKA_CONFIGURATION_TOKEN,
      ],
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
      { provide: KAFKA_ADMIN_CLIENT_TOKEN, useValue: adminClient },
      { provide: KAFKA_CONSUMER_TOKEN, useValue: consumer },
      { provide: KAFKA_PRODUCER_TOKEN, useValue: producer },
      { provide: KAFKA_CONFIGURATION_TOKEN, useValue: options },
      // { provide: KAFKA_SCHEMA_REGISTRY_TOKEN, useValue: schemaRegistry },
    ];

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

  // private static createSchemaRegistry(
  //   options: KafkaSchemaRegistryClientOptions,
  // ): SchemaRegistryClient {
  //   return new SchemaRegistryClient(options.conf);
  // }
}
