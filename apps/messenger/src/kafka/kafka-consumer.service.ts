import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { KAFKA_CONSUMER_TOKEN, KAFKA_TOPIC_METADATA } from './constants';
import { KafkaTopicName } from './topics.constants';
import { SendMessageDto } from '@/libs/contracts/src/messenger/send-message-dto';
import { EditMessageDto } from '@/libs/contracts/src/messenger/edit-message-dto';
import { DeleteMessageDto } from '@/libs/contracts/src/messenger/delete-message-dto';

type MessageEventPayload =
  | (SendMessageDto & { timestamp?: string; source?: string })
  | (EditMessageDto & { timestamp?: string; source?: string })
  | (DeleteMessageDto & { timestamp?: string; source?: string });

interface KafkaHandler {
  target: Record<string, unknown>;
  methodName: string;
  topic: KafkaTopicName;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly handlers = new Map<KafkaTopicName, KafkaHandler>();

  constructor(
    @Inject(KAFKA_CONSUMER_TOKEN)
    private readonly consumer: KafkaJS.Consumer,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    if (!this.consumer) {
      this.logger.warn('Kafka consumer not configured, skipping subscription');
      return;
    }
    this.logger.log('Kafka consumer initialized');
    try {
      // discover all kafka topic handlers
      this.discoverKafkaHandlers();

      if (this.handlers.size === 0) {
        this.logger.warn('No Kafka handlers found');
        return;
      }

      // get list of topics to subscribe to
      const topics = Array.from(this.handlers.keys());

      this.logger.log(
        `Discovered ${topics.length} Kafka topic handlers: ${topics.join(', ')}`,
      );

      // subscribe to all discovered topics
      await this.consumer.subscribe({ topics });
      this.logger.log('Subscribed to Kafka topics successfully');

      // start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(
              message.value?.toString() || '{}',
            ) as MessageEventPayload;

            this.logger.log(
              `Received message from topic ${topic}, partition ${partition}`,
            );

            // route to appropriate handler using reflection
            await this.routeMessage(topic as KafkaTopicName, payload);
          } catch (error) {
            this.logger.error(
              `Error processing message from topic ${topic}:`,
              error,
            );
            // implement dead letter queue or retry logic here if needed
          }
        },
      });

      this.logger.log('Kafka consumer is running');
    } catch (error) {
      this.logger.error('Failed to start Kafka consumer:', error);
      throw error;
    }
  }

  /**
   * discover all methods decorated with @KafkaTopic
   */
  private discoverKafkaHandlers() {
    // get all providers and controllers
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();

    const controllers: InstanceWrapper[] =
      this.discoveryService.getControllers();

    const allInstances = [...providers, ...controllers];

    allInstances.forEach((wrapper: InstanceWrapper) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { instance } = wrapper;

      if (!instance || typeof instance !== 'object') {
        return;
      }

      // scan all methods in the instance
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance) as object,
        (methodName: string) => {
          const target = instance as Record<string, unknown>;
          const methodRef = target[methodName];

          // ensure methodRef is a function before checking metadata
          if (typeof methodRef !== 'function') {
            return;
          }

          const topic = this.reflector.get<KafkaTopicName>(
            KAFKA_TOPIC_METADATA,
            methodRef,
          );

          if (topic && typeof topic === 'string') {
            this.handlers.set(topic, {
              target,
              methodName,
              topic,
            });
            this.logger.log(
              `Registered handler for topic "${topic}": ${target.constructor.name}.${methodName}`,
            );
          }
        },
      );
    });
  }

  /**
   * route a kafka message to its handler
   */
  private async routeMessage(
    topic: KafkaTopicName,
    payload: MessageEventPayload,
  ) {
    const handler = this.handlers.get(topic);

    if (!handler) {
      this.logger.warn(`No handler found for topic: ${topic}`);
      return;
    }

    const { target, methodName } = handler;
    const method = target[methodName];

    if (typeof method !== 'function') {
      this.logger.error(`Handler method is not a function: ${methodName}`);
      return;
    }

    this.logger.debug(
      `Routing message to ${target.constructor.name}.${methodName}`,
    );
    await method.call(target, payload);
  }
}
