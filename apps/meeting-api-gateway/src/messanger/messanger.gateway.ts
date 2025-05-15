import { Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, WebSocket } from 'ws';

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
export class MessangerGateway {
  private readonly logger = new Logger(MessangerGateway.name);

  constructor(
    @Inject('MEETING_SERVICE') private readonly meetingClient: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('client.message', {
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
