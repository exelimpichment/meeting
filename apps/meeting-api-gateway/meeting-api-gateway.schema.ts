import { z } from 'zod';
import { jwtEnvSchema } from '@/libs/shared-authentication/src/configs/jwt-env.schema';

export const meetingApiGatewayEnvSchema = z
  .object({
    // ======= Environment =======

    PORT: z.string(),
    BASE_URL: z.string(),
    WEB_APP_URL: z.string(),

    //  ======= Database =========
    DATABASE_URL: z.string(),
    KAFKA_BROKER: z.string({ required_error: 'KAFKA_BROKER is required' }),
    NATS_URL: z.string({ required_error: 'NATS_URL is required' }),

    // ======= Refresh Token =======
    JWT_REFRESH_SECRET: z.string(),
    JWT_REFRESH_EXPIRATION_TIME: z.string(),
  })
  .merge(jwtEnvSchema);

export type MeetingApiGatewayEnv = z.infer<typeof meetingApiGatewayEnvSchema>;
