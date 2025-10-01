import { jwtConfig } from '../configs/jwt-config';
import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

type AuthenticatedWebSocket = WebSocket & {
  [REQUEST_USER_KEY]?: Record<string, unknown>;
  // attached by custom WebSocket adapter for accessing cookies/headers
  upgradeReq?: IncomingMessage;
};

@Injectable()
export class WsAccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      throw new WsException('This guard is for WebSocket contexts only');
    }

    const client = context.switchToWs().getClient<AuthenticatedWebSocket>();

    const token = this.extractTokenFromCookie(client);

    if (!token) {
      this.closeConnectionWithError(client, 'Authentication token not found');
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, {
        secret: this.jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
        audience: this.jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
      });

      // attach user payload to client for use in handlers (similar to request.user)
      client[REQUEST_USER_KEY] = payload;
      return true;
    } catch (error) {
      let errorMessage = 'Invalid authentication token';

      if (error instanceof TokenExpiredError) {
        errorMessage = 'Your session has expired. Please sign in again.';
      }

      this.closeConnectionWithError(client, errorMessage);
      return false;
    }
  }

  private closeConnectionWithError(
    client: AuthenticatedWebSocket,
    message: string,
  ): void {
    // send error message to client before closing
    try {
      client.send(
        JSON.stringify({
          event: 'error',
          data: {
            message,
            code: 'AUTHENTICATION_FAILED',
          },
        }),
      );
    } catch {
      // ignore send errors
    }

    // close the connection with a specific code for auth failure
    client.close(4401, message);
  }

  private extractTokenFromCookie(
    client: AuthenticatedWebSocket,
  ): string | undefined {
    // access the upgrade request that was attached by the custom adapter
    const request = client.upgradeReq;

    if (!request) {
      console.error('No upgrade request found on WebSocket client');
      return undefined;
    }

    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      console.log('No cookie header found');
      return undefined;
    }

    // simple cookie parser for the specific token
    const cookieMap: Record<string, string> = cookieHeader
      .split('; ')
      .reduce((acc, cur) => {
        const [key, ...valParts] = cur.split('=');
        const val = valParts.join('=');
        acc[key.trim()] = decodeURIComponent(val);
        return acc;
      }, {});

    return cookieMap['access_token'];
  }

  /**
   * direct method to authenticate a token without execution context
   * returns the user payload if authentication is successful
   * throws WsException with proper error message if authentication fails
   */
  async authenticateToken(token: string): Promise<Record<string, unknown>> {
    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, {
        secret: this.jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
        audience: this.jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
      });

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);

      if (error instanceof TokenExpiredError) {
        throw new WsException(
          'Your session has expired. Please sign in again.',
        );
      }
      throw new WsException('Invalid authentication token');
    }
  }
}
