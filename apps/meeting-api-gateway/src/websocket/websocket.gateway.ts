import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({
  path: '/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    @Inject('MEETING_SERVICE') private readonly meetingClient: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway Initialized');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: WebSocket): void {
    this.logger.log('Client connected');

    // Notify the meeting service about the new connection
    this.meetingClient.emit('client.connected', {
      timestamp: new Date().toISOString(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: WebSocket): void {
    this.logger.log('Client disconnected');

    // Notify the meeting service about the client disconnection
    this.meetingClient.emit('client.disconnected', {
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: WebSocket, message: string): void {
    this.logger.log(`Received message: ${message}`);

    // Forward the message to the meeting service
    this.meetingClient.emit('client.message', {
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
