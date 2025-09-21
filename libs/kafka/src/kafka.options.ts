import { ModuleMetadata, InjectionToken } from '@nestjs/common';
import { ClientConfig } from '@confluentinc/schemaregistry';
import { KafkaJS } from '@confluentinc/kafka-javascript';

export interface KafkaConnectionOptions {
  consumer?: KafkaConsumerOptions;
  producer?: KafkaProducerOptions;
  adminClient?: KafkaAdminClientOptions;
  schemaRegistry?: KafkaSchemaRegistryClientOptions;
  global?: boolean;
}

export interface KafkaAdminClientOptions {
  autoConnect?: boolean;
  conf: KafkaJS.AdminConstructorConfig;
}

export interface KafkaConnectionAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: unknown[]
  ) => Promise<KafkaConnectionOptions> | KafkaConnectionOptions;
  inject?: InjectionToken[];
  global?: boolean;
}

export interface KafkaConsumerOptions {
  conf: KafkaJS.ConsumerConstructorConfig;
  autoConnect?: boolean;
}

export interface KafkaProducerOptions {
  conf: KafkaJS.ProducerConstructorConfig;
  autoConnect?: boolean;
}

export interface KafkaSchemaRegistryClientOptions {
  conf: ClientConfig;
}
