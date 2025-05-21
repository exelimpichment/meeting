import { z } from 'zod';

export const meetingApiGatewayEnvSchema = z.object({
  KAFKA_BROKER: z.string({ required_error: 'KAFKA_BROKER is required' }),
  DATABASE_URL: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_AUDIENCE: z.string(),
  JWT_ACCESS_TOKEN_ISSUER: z.string(),
  JWT_ACCESS_TOKEN_TTL: z
    .string()
    .default('3600')
    .transform((val) => parseInt(val, 10)),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION_TIME: z.string(),
});

export type MeetingApiGatewayEnv = z.infer<typeof meetingApiGatewayEnvSchema>;
