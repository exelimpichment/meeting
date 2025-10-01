import { IncomingMessage } from 'http';
import { jwtEnvSchema } from '../configs/jwt-env.schema';
import { z } from 'zod';
import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';

export type JwtEnvSchema = z.infer<typeof jwtEnvSchema>;

export enum AuthType {
  Bearer,
  None,
}

/**
 * jwt payload structure for access tokens
 */
export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

/**
 * type for a WebSocket client that has been authenticated and has a user payload attached.
 */

export type ExtendedWebSocket = WebSocket & {
  upgradeReq?: IncomingMessage;
};

export type AuthenticatedWebSocket = ExtendedWebSocket & {
  [REQUEST_USER_KEY]?: JwtPayload;
};
