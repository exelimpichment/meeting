import { KafkaProducerService } from '@/apps/meeting-api-gateway/src/kafka/kafka.producer.service';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

// define interface for WebSocket with user data
interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    sub: string;
    [key: string]: unknown;
  };
}

@WebSocketGateway({
  path: '/ws/messages',
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
}
