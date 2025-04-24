import { z } from 'zod';

// Define the schema for environment variables
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  TEST: z.string(),
});

// Infer the type from the schema
export type MeetingEnv = z.infer<typeof envSchema>;
