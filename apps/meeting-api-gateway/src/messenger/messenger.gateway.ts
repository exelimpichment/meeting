import { Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, WebSocket } from 'ws';
import { MEETING_SERVICE } from '@apps/meeting-api-gateway/src/consts';

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

  constructor(
    @Inject(MEETING_SERVICE) private readonly meetingClient: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message:send')
  handleMessage(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('client.message.send', {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message:delete')
  handleMessageDelete(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('client.message.delete', {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message:edit')
  handleMessageEdit(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('client.message.edit', {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }

  @SubscribeMessage('message:writing')
  handleMessageWriting(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('client.message.writing', {
      userId: client.user?.sub,
      message,
      timestamp: new Date().toISOString(),
    });

    // Echo back to the client
    client.send(
      JSON.stringify({
        event: 'messageReceived',
        data: message,
      }),
    );
  }
}
