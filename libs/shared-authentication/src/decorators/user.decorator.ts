import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '@/libs/shared-authentication/src/types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<JwtPayload>();
    return request[REQUEST_USER_KEY] as JwtPayload | undefined;
  },
);
