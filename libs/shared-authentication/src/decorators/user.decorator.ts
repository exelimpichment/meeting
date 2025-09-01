import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): Record<string, unknown> | undefined => {
    const request = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    return request[REQUEST_USER_KEY] as Record<string, unknown> | undefined;
  },
);
