import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY, AuthType } from '../constants';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
