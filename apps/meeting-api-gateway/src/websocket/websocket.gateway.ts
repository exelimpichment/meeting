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
import { JwtService } from '@nestjs/jwt';
import { parse } from 'url';

// Define interface for WebSocket with user data
interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

// Define user payload interface
interface JwtPayload {
  sub: string;
  [key: string]: any;
}

@WebSocketGateway({
  path: '/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    @Inject('MEETING_SERVICE') private readonly meetingClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: AuthenticatedWebSocket, request: Request): void {
    try {
      // Extract token from query parameters
      const { query } = parse(request.url, true);
      const token = query.token as string;

      if (!token) {
        this.handleUnauthorized(client, 'Missing authentication token');
        return;
      }

      // Verify the token
      try {
        const payload = this.jwtService.verify<JwtPayload>(token);
        client.user = payload;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.handleUnauthorized(client, 'Invalid authentication token');
        return;
      }

      this.logger.log('Client connected');

      // Notify the meeting service about the new connection
      this.meetingClient.emit('client.connected', {
        userId: client.user?.sub,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Authentication error', error);
      this.handleUnauthorized(client, 'Authentication failed');
    }
  }

  private handleUnauthorized(
    client: AuthenticatedWebSocket,
    message: string,
  ): void {
    this.logger.error(`Unauthorized connection: ${message}`);
    client.send(
      JSON.stringify({
        event: 'error',
        message: 'Unauthorized: ' + message,
      }),
    );
    client.close(1008, 'Unauthorized');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: AuthenticatedWebSocket): void {
    this.logger.log('Client disconnected');

    // Notify the meeting service about the client disconnection
    this.meetingClient.emit('client.disconnected', {
      userId: client.user?.sub,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: AuthenticatedWebSocket, message: string): void {
    this.logger.log(`Received message: ${message}`);

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
