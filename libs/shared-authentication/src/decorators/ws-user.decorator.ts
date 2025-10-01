import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { AuthenticatedWebSocket } from '@/libs/shared-authentication/src/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: AuthenticatedWebSocket = ctx.switchToWs().getClient();
    return client[REQUEST_USER_KEY];
  },
);
