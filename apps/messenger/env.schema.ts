import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const MessengerEnvSchema = z.object({
  DATABASE_URL: z.string(),
  KAFKA_BROKER: z.string(),
  NATS_SERVER: z.string().default('nats://localhost:4222'),
  KAFKA_GROUP_ID: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export function getEnvConfig(configService: ConfigService<MessengerEnv>) {
  return {
    DATABASE_URL: configService.get<string>('DATABASE_URL'),
    KAFKA_BROKER: configService.get<string>('KAFKA_BROKER'),
    NATS_SERVER: configService.get<string>('NATS_SERVER'),
    KAFKA_GROUP_ID: configService.get<string>('KAFKA_GROUP_ID'),
    NODE_ENV: configService.get<string>('NODE_ENV') || 'development',
  };
}

export type MessengerEnv = z.infer<typeof MessengerEnvSchema>;
