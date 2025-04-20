import { z } from 'zod';

// Define the schema for environment variables
export const IAmEnvSchema = z.object({
  DATABASE_URL: z.string(),
});

// Infer the type from the schema
export type IAmEnv = z.infer<typeof IAmEnvSchema>;
