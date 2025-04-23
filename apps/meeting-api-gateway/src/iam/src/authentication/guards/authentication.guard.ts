import { AUTH_TYPE_KEY } from '@apps/meeting-api-gateway/src/iam/src/authentication/decorators';
import { AccessTokenGuard } from '@apps/meeting-api-gateway/src/iam/src/authentication/guards';
import { AuthType } from '@apps/meeting-api-gateway/src/iam/src/authentication/enums';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  private get authTypeGuardMap(): Record<
    AuthType,
    CanActivate | CanActivate[]
  > {
    return {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    let error: UnauthorizedException = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err: unknown) => {
        error =
          err instanceof UnauthorizedException
            ? err
            : new UnauthorizedException();
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}
