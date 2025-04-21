import { z } from 'zod';

// Define the schema for environment variables
export const IAmEnvSchema = z.object({
  DATABASE_URL: z.string(),

  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_AUDIENCE: z.string(),
  JWT_ACCESS_TOKEN_ISSUER: z.string(),
  JWT_ACCESS_TOKEN_TTL: z
    .string()
    .default('3600')
    .transform((val) => parseInt(val, 10)),
});

// Infer the type from the schema
export type IAmEnv = z.infer<typeof IAmEnvSchema>;
