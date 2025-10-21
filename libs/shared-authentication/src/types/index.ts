import { jwtEnvSchema } from '@/libs/shared-authentication/src/configs/jwt-env.schema';
import { REQUEST_USER_KEY } from '@/libs/shared-authentication/src/constants';
import { IncomingMessage } from 'http';
import type { WebSocket } from 'ws';
import { z } from 'zod';

export type JwtEnvSchema = z.infer<typeof jwtEnvSchema>;

export enum AuthType {
  Bearer,
  None,
}

/**
 * jwt payload structure for access tokens
 */
export interface JwtPayload {
  jti?: string;
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
