import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { AccessTokenGuard } from '@apps/meeting-api-gateway/src/iam/src/authentication/guards';
import { REQUEST_USER_KEY } from '@apps/meeting-api-gateway/src/iam/iam.constants';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Define interface for WebSocket with user data
interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

// Define request interface for authentication
interface AuthRequest extends Request {
  cookies: Record<string, string>;
  [REQUEST_USER_KEY]?: {
    sub: string;
    [key: string]: any;
  };
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
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(
    client: AuthenticatedWebSocket,
    request: IncomingMessage,
  ): void {
    try {
      // Extract token from cookies
      const cookieHeader = request.headers.cookie;
      if (!cookieHeader) {
        this.handleUnauthorized(client, 'No cookies provided');
        return;
      }

      // Extract access_token from cookie header
      const accessToken = this.extractCookieValue(cookieHeader, 'access_token');
      if (!accessToken) {
        this.handleUnauthorized(client, 'Missing authentication token');
        return;
      }

      // Basic token format validation (JWT tokens have 3 parts separated by dots)
      if (!this.isValidTokenFormat(accessToken)) {
        this.handleUnauthorized(client, 'Malformed token format');
        return;
      }

      // Create a mock request object that AccessTokenGuard can use
      const mockRequest = {
        cookies: { access_token: accessToken },
      } as any as AuthRequest;

      // Use AccessTokenGuard's verification logic
      // We need to create a minimal execution context that the guard can use
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
      } as ExecutionContext;

      // Use the guard to verify the token
      this.accessTokenGuard
        .canActivate(mockExecutionContext)
        .then(() => {
          // Authentication successful, get the user data from the request
          client.user = mockRequest[REQUEST_USER_KEY];

          this.logger.log('Client connected');

          // Notify the meeting service about the new connection
          this.meetingClient.emit('client.connected', {
            userId: client.user?.sub,
            timestamp: new Date().toISOString(),
          });
        })
        .catch((error) => {
          this.logger.error('Token validation failed', error);
          this.handleUnauthorized(client, 'Invalid authentication token');
        });
    } catch (error) {
      this.logger.error('Authentication error', error);
      this.handleUnauthorized(client, 'Authentication failed');
    }
  }

  /**
   * Basic validation of JWT token format
   * A valid JWT token has 3 parts separated by dots
   */
  private isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.trim().length > 0);
  }

  /**
   * Extract a cookie value from the cookie header
   */
  private extractCookieValue(
    cookieHeader: string,
    cookieName: string,
  ): string | undefined {
    const cookies: Record<string, string> = {};

    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        cookies[name] = value;
      }
    });

    return cookies[cookieName];
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
}
