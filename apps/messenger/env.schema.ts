import { z } from 'zod';

// Define the schema for environment variables
export const MessengerEnvSchema = z.object({
  DATABASE_URL: z.string(),
});

// Infer the type from the schema
export type MessengerEnv = z.infer<typeof MessengerEnvSchema>;
