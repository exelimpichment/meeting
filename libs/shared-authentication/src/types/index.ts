import { jwtEnvSchema } from '../configs/jwt-env.schema';
import { z } from 'zod';

export type JwtEnvSchema = z.infer<typeof jwtEnvSchema>;

export enum AuthType {
  Bearer,
  None,
}
