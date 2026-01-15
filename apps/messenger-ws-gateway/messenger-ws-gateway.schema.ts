import { supabaseEnvSchema } from '@/libs/shared-authentication/src/configs/supabase-env.schema';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

export const MessengerWsGatewayEnvSchema = z
  .object({
    KAFKA_BROKER: z.string(),
    NATS_SERVER: z.string(),
    PORT: z.coerce.number(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .merge(supabaseEnvSchema);

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
