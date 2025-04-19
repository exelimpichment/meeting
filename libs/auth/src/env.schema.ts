import { z } from 'zod';

// Define the schema for environment variables
export const authEnvSchema = z.object({
  DATABASE_URL: z.string(),
});

// Infer the type from the schema
export type AuthEnv = z.infer<typeof authEnvSchema>;
