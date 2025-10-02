import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { jwtConfig } from '@/libs/shared-authentication/src/configs/jwt-config';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
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
export class HttpAccessTokenGuard implements CanActivate {
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
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
        audience: this.jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
      });

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
  async authenticateToken(token: string): Promise<JwtPayload> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtConfiguration.JWT_ACCESS_TOKEN_SECRET,
        audience: this.jwtConfiguration.JWT_ACCESS_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.JWT_ACCESS_TOKEN_ISSUER,
      });

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
