import { HttpAccessTokenGuard } from './http-access-token.guard';
import { AuthType, AUTH_TYPE_KEY } from '../constants';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WsAccessTokenGuard } from './ws-access-token.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  constructor(
    private readonly reflector: Reflector,
    private readonly httpAccessTokenGuard: HttpAccessTokenGuard,
    private readonly wsAccessTokenGuard: WsAccessTokenGuard, // Inject WS guard
  ) {}

  private getAuthTypeGuardMap(
    context: ExecutionContext,
  ): Record<AuthType, CanActivate | CanActivate[]> {
    const type = context.getType();
    if (type === 'http') {
      return {
        [AuthType.Bearer]: this.httpAccessTokenGuard,
        [AuthType.None]: { canActivate: () => true },
      };
    } else if (type === 'ws') {
      return {
        [AuthType.Bearer]: this.wsAccessTokenGuard,
        [AuthType.None]: { canActivate: () => true },
      };
    } else {
      throw new Error('Unsupported context type');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guardMap = this.getAuthTypeGuardMap(context);
    const guards = authTypes.map((type) => guardMap[type]).flat();

    const isWsContext = context.getType() === 'ws';

    let error: UnauthorizedException | WsException = isWsContext
      ? new WsException('Authentication failed')
      : new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err: unknown) => {
        error = this.mapExceptionToContext(err, isWsContext);
        return false;
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }

  private mapExceptionToContext(
    err: unknown,
    isWsContext: boolean,
  ): UnauthorizedException | WsException {
    if (isWsContext) {
      // For WebSocket context, preserve WsException or create a new one
      return err instanceof WsException
        ? err
        : new WsException('Authentication failed');
    } else {
      // For HTTP context, preserve UnauthorizedException or create a new one
      return err instanceof UnauthorizedException
        ? err
        : new UnauthorizedException();
    }
  }
}
