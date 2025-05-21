import { z } from 'zod';

export const meetingApiGatewayEnvSchema = z.object({
  KAFKA_BROKER: z.string({ required_error: 'KAFKA_BROKER is required' }),
});

export type MeetingApiGatewayEnv = z.infer<typeof meetingApiGatewayEnvSchema>;
