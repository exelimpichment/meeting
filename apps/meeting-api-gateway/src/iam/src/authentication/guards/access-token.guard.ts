import { REQUEST_USER_KEY } from '@/apps/meeting-api-gateway/src/constants';
import { jwtConfig } from '@/apps/meeting-api-gateway/src/iam/jwt.config';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, this.jwtConfiguration);

      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Your session has expired. Please sign in again.',
        );
      }
      throw new UnauthorizedException('Invalid authentication token');
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['access_token'] as string | undefined;
  }

  /**
   * Direct method to authenticate a token without execution context
   * Returns the user payload if authentication is successful
   */
  async authenticateToken(token: string): Promise<Record<string, unknown>> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, this.jwtConfiguration);

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Your session has expired. Please sign in again.',
        );
      }
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
