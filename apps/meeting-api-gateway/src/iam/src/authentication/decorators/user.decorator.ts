import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '@apps/meeting-api-gateway/src/constants';

export const User = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): Record<string, unknown> | undefined => {
    const request = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    return request[REQUEST_USER_KEY] as Record<string, unknown> | undefined;
  },
);
