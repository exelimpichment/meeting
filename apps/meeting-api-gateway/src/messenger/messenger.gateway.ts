import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { KafkaProducerService } from '../kafka/kafka.producer.service';

// Define interface for WebSocket with user data
interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

@WebSocketGateway({
  path: '/ws',
})
export class MessengerGateway {
  private readonly logger = new Logger(MessengerGateway.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message.send')
  async handleMessage(
    client: AuthenticatedWebSocket,
    message: string,
  ): Promise<void> {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // Forward the message to the meeting service via Kafka
    await this.kafkaProducerService.send({
      topic: 'messenger.send',
      messages: [{ value: JSON.stringify(payload) }],
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.delete')
  async handleMessageDelete(
    client: AuthenticatedWebSocket,
    message: string,
  ): Promise<void> {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // Forward the message to the meeting service via Kafka
    await this.kafkaProducerService.send({
      topic: 'messenger.delete',
      messages: [{ value: JSON.stringify(payload) }],
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.edit')
  async handleMessageEdit(
    client: AuthenticatedWebSocket,
    message: string,
  ): Promise<void> {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // Forward the message to the meeting service via Kafka
    await this.kafkaProducerService.send({
      topic: 'messenger.edit',
      messages: [{ value: JSON.stringify(payload) }],
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.writing')
  async handleMessageWriting(
    client: AuthenticatedWebSocket,
    message: string,
  ): Promise<void> {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // Forward the message to the meeting service via Kafka
    // For 'send' type events in Kafka (request-response), you typically don't get a direct response like with RPC.
    // The microservice consuming this Kafka event would handle the logic and potentially send a WebSocket message back to the client if needed,
    // or the client might listen on a specific Kafka topic for responses if your architecture dictates.
    // Here, we'll just send to Kafka and echo back a confirmation.
    try {
      await this.kafkaProducerService.send({
        topic: 'messenger.writing',
        messages: [{ value: JSON.stringify(payload) }],
      });
      // Echo back to the client - adjust response as needed
      client.send(
        JSON.stringify({
          event: 'writingResponse',
          data: 'Writing event sent to Kafka',
        }),
      );
    } catch (err) {
      this.logger.error(
        'Error sending message to Kafka for messenger.writing',
        err,
      );
      client.send(
        JSON.stringify({
          event: 'writingError',
          data: 'Failed to send writing event',
        }),
      );
    }
  }

  @SubscribeMessage('message.stopWriting')
  async handleMessageStopWriting(
    client: AuthenticatedWebSocket,
    message: string,
  ): Promise<void> {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // Forward the message to the meeting service via Kafka
    try {
      await this.kafkaProducerService.send({
        topic: 'messenger.stopWriting',
        messages: [{ value: JSON.stringify(payload) }],
      });
      // Echo back to the client - adjust response as needed
      client.send(
        JSON.stringify({
          event: 'stopWritingResponse',
          data: 'Stop writing event sent to Kafka',
        }),
      );
    } catch (err) {
      this.logger.error(
        'Error sending message to Kafka for messenger.stopWriting',
        err,
      );
      client.send(
        JSON.stringify({
          event: 'stopWritingError',
          data: 'Failed to send stop writing event',
        }),
      );
    }
  }
}
