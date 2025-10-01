import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const MessengerWsGatewayEnvSchema = z.object({
  KAFKA_BROKER: z.string(),
  NATS_SERVER: z.string(),
  PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export function getEnvConfig(
  configService: ConfigService<MessengerWsGatewayEnv>,
) {
  return {
    NODE_ENV: configService.get<string>('NODE_ENV') || 'development',
    KAFKA_BROKER: configService.get<string>('KAFKA_BROKER'),
    NATS_SERVER: configService.get<string>('NATS_SERVER'),
    PORT: configService.get<number>('PORT') || 3002,
  };
}

export type MessengerWsGatewayEnv = z.infer<typeof MessengerWsGatewayEnvSchema>;
