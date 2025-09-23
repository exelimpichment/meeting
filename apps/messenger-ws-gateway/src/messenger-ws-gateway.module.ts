import { MessengerWsGatewayEnvSchema } from '@/apps/messenger-ws-gateway/messenger-ws-gateway.schema';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { KafkaModule } from '@/apps/messenger-ws-gateway/src/kafka/kafka.module';
import { MessengerWsGatewayController } from './messenger-ws-gateway.controller';
import { MessengerWsGatewayService } from './messenger-ws-gateway.service';
import { ConfigModule as CustomConfigModule } from '@config/config.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { Module } from '@nestjs/common';
import path from 'path';

@Module({
  imports: [
    KafkaModule.forRoot({}),

    NestConfigModule.forRoot({
      isGlobal: true,

      envFilePath: path.join(__dirname, '../../../.env.messenger-ws-gateway'),

      validate: (config) => {
        // apply defaults for missing environment variables
        const result = MessengerWsGatewayEnvSchema.safeParse(config);
        if (!result.success) {
          console.error(
            'Environment validation error:',
            result.error.flatten().fieldErrors,
          );
          throw new Error(
            'Invalid environment variables for messenger-ws-gateway',
          );
        }
        // merge parsed data with original config to preserve all env vars
        return { ...config, ...result.data };
      },
    }),
    CustomConfigModule,
    SharedAuthenticationModule.forRoot(), // handles JWT validation internally
    MessagesModule,
  ],
  controllers: [MessengerWsGatewayController],
  providers: [MessengerWsGatewayService],
})
export class MessengerWsGatewayModule {}
