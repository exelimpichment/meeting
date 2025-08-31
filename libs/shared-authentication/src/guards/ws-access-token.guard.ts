import { jwtConfig } from '../configs/jwt-config';
import { REQUEST_USER_KEY } from '../constants';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocket } from 'ws';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

type AuthenticatedWebSocket = WebSocket & {
  [REQUEST_USER_KEY]?: Record<string, unknown>;
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
      throw new WsException('Authentication token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, this.jwtConfiguration);

      // Attach user payload to client for use in handlers (similar to request.user)
      client[REQUEST_USER_KEY] = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new WsException(
          'Your session has expired. Please sign in again.',
        );
      }
      throw new WsException('Invalid authentication token');
    }
    return true;
  }

  private extractTokenFromCookie(
    client: AuthenticatedWebSocket,
  ): string | undefined {
    // Access the request information through the client's upgrade request
    const clientWithRequest = client as AuthenticatedWebSocket & {
      upgradeReq?: { headers: { cookie?: string } };
      request?: { headers: { cookie?: string } };
    };

    const request = clientWithRequest.upgradeReq || clientWithRequest.request;

    if (!request?.headers?.cookie) {
      return undefined;
    }

    const cookies = request.headers.cookie;

    // Simple cookie parser for the specific token
    const cookieMap: Record<string, string> = cookies
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
   * Direct method to authenticate a token without execution context
   * Returns the user payload if authentication is successful
   */
  async authenticateToken(token: string): Promise<Record<string, unknown>> {
    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, this.jwtConfiguration);

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new WsException(
          'Your session has expired. Please sign in again.',
        );
      }
      throw new WsException('Invalid authentication token');
    }
  }
}
