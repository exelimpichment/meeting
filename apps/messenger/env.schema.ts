import { z } from 'zod';

export const MessengerEnvSchema = z.object({
  DATABASE_URL: z.string(),
  KAFKA_BROKER: z.string(),
  KAFKA_GROUP_ID: z.string(),
});

export type MessengerEnv = z.infer<typeof MessengerEnvSchema>;

// Optional: token for injection
export const MESSENGER_ENV = 'MESSENGER_ENV';
