import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
// ProducerRecord import might no longer be needed if send method signature changes
// import { ProducerRecord } from 'kafkajs';
import { MEETING_API_SERVICE_CLIENT } from '../constants'; // Will add this import later

@Injectable()
export class KafkaProducerService {
  constructor(
    @Inject(MEETING_API_SERVICE_CLIENT) private readonly client: ClientKafka,
  ) {}

  /**
   * Sends a message to a Kafka topic using client.emit().
   * The nature of client.emit() is often fire-and-forget, but it may return a Promise
   * for acknowledgment from the broker depending on the client and its configuration.
   * @param topic The Kafka topic.
   * @param payload The message payload.
   * @returns The result of the client.emit() call (could be void or Promise<any>).
   */
  send(topic: string, payload: any) {
    // Not making the function async. Returning whatever client.emit returns.
    // The caller can choose to await if it receives a Promise.
    return this.client.emit(topic, payload);
  }

  async sendBatch(
    topic: string,
    messages: Array<{ key?: string; value: string }>,
  ) {
    const sendPromises = messages.map((msg) =>
      this.client.emit(topic, { key: msg.key, value: msg.value }),
    );
    // Awaiting all promises from the emit calls.
    // This assumes client.emit returns a Promise or something Promise.all can handle.
    await Promise.all(sendPromises.map((p) => Promise.resolve(p)));
  }
}
