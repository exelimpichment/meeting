import { z } from 'zod';
import { jwtEnvSchema } from '@/libs/shared-authentication/src/configs/jwt-env.schema';

export const meetingApiGatewayEnvSchema = z
  .object({
    // ======= Environment =======

    PORT: z.string(),
    BASE_URL: z.string(),
    WEB_APP_URL: z.string(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    //  ======= Database =========
    DATABASE_URL: z.string(),
    KAFKA_BROKER: z.string({ required_error: 'KAFKA_BROKER is required' }),
    NATS_URL: z
      .string({ required_error: 'NATS_URL is required' })
      .default('nats://localhost:4222'),

    // ======= cache (redis via keyv) =======
    CACHE_REDIS_URL: z.string().default('redis://localhost:6379'),
    CACHE_TTL_MS: z.coerce.number().default(60000),

    // ======= Refresh Token =======
    JWT_REFRESH_SECRET: z.string(),
    JWT_REFRESH_EXPIRATION_TIME: z.string(),
  })
  .merge(jwtEnvSchema);

export type MeetingApiGatewayEnv = z.infer<typeof meetingApiGatewayEnvSchema>;
