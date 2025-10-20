import { z } from 'zod';

export const jwtEnvSchema = z.object({
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_AUDIENCE: z.string(),
  JWT_ACCESS_TOKEN_ISSUER: z.string(),
  JWT_ACCESS_TOKEN_TTL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3600'),
  JWT_REFRESH_TOKEN_TTL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('86400'),
});
