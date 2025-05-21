import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { MeetingApiGatewayEnv } from '../../meeting-api-gateway.schema';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(
    private readonly configService: ConfigService<MeetingApiGatewayEnv>,
  ) {
    const kafkaBroker = this.configService.get<string>('KAFKA_BROKER')!;

    this.kafka = new Kafka({
      clientId: 'meeting-api-gateway-producer',
      brokers: [kafkaBroker],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async send(record: ProducerRecord) {
    return this.producer.send(record);
  }

  async sendBatch(
    topic: string,
    messages: Array<{ key?: string; value: string }>,
  ) {
    const kafkaMessages = messages.map((msg) => ({
      key: msg.key,
      value: msg.value,
    }));
    return this.producer.send({
      topic,
      messages: kafkaMessages,
    });
  }
}
