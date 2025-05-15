import { MEETING_SERVICE } from '@apps/meeting-api-gateway/src/consts';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

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

  @SubscribeMessage('message.send')
  handleMessage(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('messenger.send', {
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

  @SubscribeMessage('message.delete')
  handleMessageDelete(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('messenger.delete', {
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

  @SubscribeMessage('message.edit')
  handleMessageEdit(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    this.meetingClient.emit('messenger.edit', {
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

  @SubscribeMessage('message.writing')
  handleMessageWriting(client: AuthenticatedWebSocket, message: string): void {
    // Forward the message to the meeting service
    const responseObservable = this.meetingClient.send<string>(
      'messenger.writing',
      {
        userId: client.user?.sub,
        message,
        timestamp: new Date().toISOString(),
      },
    );

    responseObservable.subscribe({
      next: (response: string) => {
        // Echo back to the client
        client.send(
          JSON.stringify({ event: 'writingResponse', data: response }),
        );
      },
      error: (err) => {
        this.logger.error(
          'Error receiving response from messenger.writing',
          err,
        );
        client.send(
          JSON.stringify({
            event: 'writingError',
            data: 'Failed to get response',
          }),
        );
      },
    });
  }

  @SubscribeMessage('message.stopWriting')
  handleMessageStopWriting(
    client: AuthenticatedWebSocket,
    message: string,
  ): void {
    // Forward the message to the meeting service
    const responseObservable = this.meetingClient.send<string>(
      'messenger.stopWriting',
      {
        userId: client.user?.sub,
        message,
        timestamp: new Date().toISOString(),
      },
    );

    responseObservable.subscribe({
      next: (response: string) => {
        // Echo back to the client
        client.send(
          JSON.stringify({ event: 'writingResponse', data: response }),
        );
      },
      error: (err) => {
        this.logger.error(
          'Error receiving response from messenger.writing',
          err,
        );
        client.send(
          JSON.stringify({
            event: 'writingError',
            data: 'Failed to get response',
          }),
        );
      },
    });
  }
}
