import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { KafkaProducerService } from '../../kafka/kafka.producer.service';

// define interface for WebSocket with user data
interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    sub: string;
    [key: string]: unknown;
  };
}

@WebSocketGateway({
  path: '/ws',
})
export class MessagesGateway {
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message.send')
  handleMessage(client: AuthenticatedWebSocket, message: string): void {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    this.kafkaProducerService.send('messenger.send', payload);

    // echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.delete')
  handleMessageDelete(client: AuthenticatedWebSocket, message: string): void {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    this.kafkaProducerService.send('messenger.delete', payload);

    // echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.edit')
  handleMessageEdit(client: AuthenticatedWebSocket, message: string): void {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    this.kafkaProducerService.send('messenger.edit', payload);

    // echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message.writing')
  handleMessageWriting(client: AuthenticatedWebSocket, message: string): void {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    // for 'send' type events in Kafka (request-response), you typically don't get a direct response like with RPC.
    // the microservice consuming this Kafka event would handle the logic and potentially send a WebSocket message back to the client if needed,
    // or the client might listen on a specific Kafka topic for responses if your architecture dictates.
    // here, we'll just send to Kafka and echo back a confirmation.
    try {
      this.kafkaProducerService.send('messenger.writing', payload);
      // echo back to the client - adjust response as needed
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
  handleMessageStopWriting(
    client: AuthenticatedWebSocket,
    message: string,
  ): void {
    const payload = {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    try {
      this.kafkaProducerService.send('messenger.stopWriting', payload);
      // echo back to the client - adjust response as needed
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
