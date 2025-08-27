import { Injectable, Logger } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { AccessTokenGuard } from '../iam/src/authentication/guards/access-token.guard';
import { REQUEST_USER_KEY } from '../constants';

@Injectable()
export class WsAuthService {
  private readonly logger = new Logger(WsAuthService.name);

  constructor(private readonly accessTokenGuard: AccessTokenGuard) {}

  async authenticate(
    client: WebSocket,
    request: IncomingMessage,
  ): Promise<void> {
    try {
      const cookieHeader = request.headers.cookie;

      if (!cookieHeader) {
        throw new Error('No cookies provided');
      }

      const accessToken = this.extractCookieValue('access_token', cookieHeader);
      if (!accessToken) {
        throw new Error('Missing authentication token');
      }

      const payload =
        await this.accessTokenGuard.authenticateToken(accessToken);
      client[REQUEST_USER_KEY] = payload;

      this.logger.log(`client connected: ${payload.sub}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `authentication error during WebSocket connection: ${message}`,
      );
      this.handleUnauthorized(client, message);
      throw error;
    }
  }

  private extractCookieValue(
    cookieName: string,
    cookieHeader: string,
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

  private handleUnauthorized(client: WebSocket, message: string): void {
    this.logger.error(`unauthorized connection: ${message}`);
    client.send(
      JSON.stringify({
        event: 'error',
        message: 'Unauthorized: ' + message,
      }),
    );
    client.close(1008, 'Unauthorized');
  }
}
