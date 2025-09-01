import { z } from 'zod';

export const MessengerEnvSchema = z.object({
  DATABASE_URL: z.string(),
  KAFKA_BROKER: z.string(),
  KAFKA_GROUP_ID: z.string(),
  NATS_URL: z.string().default('nats://localhost:4222'),
});

export type MessengerEnv = z.infer<typeof MessengerEnvSchema>;

// Optional: token for injection
export const MESSENGER_ENV = 'MESSENGER_ENV';
