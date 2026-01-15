import { MeetingApiGatewayController } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { ConversationsModule } from '@/apps/meeting-api-gateway/src/conversations/conversations.module';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { MeetingApiGatewayService } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards';
import { supabaseEnvSchema } from '@/libs/shared-authentication/src/configs/supabase-env.schema';
import { KafkaModule } from '@/apps/meeting-api-gateway/src/kafka/kafka.module';
import { UsersModule } from '@/apps/meeting-api-gateway/src/users/users.module';
import { NatsModule } from '@/apps/meeting-api-gateway/src/nats/nats.module';
import { ConfigModule as CustomConfigModule } from '@config/config.module';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ContextMiddleware, RequestLoggerMiddleware } from '@app/logging';
import { KeyvCacheModule } from '@app/cache/keyv-cache.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LoggingModule } from '@app/logging/logging.module';
import { ConfigService } from '@config/config.service';
import { APP_GUARD } from '@nestjs/core';
import type { ZodError } from 'zod';
import { cwd } from 'process';
import { join } from 'path';
import {
  MeetingApiGatewayEnv,
  meetingApiGatewayEnvSchema,
} from '@/apps/meeting-api-gateway/meeting-api-gateway.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,

      envFilePath: join(
        cwd(),
        'apps/meeting-api-gateway/.env.meeting-api-gateway',
      ),

      validate: (config) => {
        const mergedSchemas =
          meetingApiGatewayEnvSchema.merge(supabaseEnvSchema);

        const result = mergedSchemas.safeParse(config);

        if (!result.success) {
          const flattened = (result.error as ZodError).flatten();
          console.error('Environment validation error:', flattened.fieldErrors);
          throw new Error(
            'Invalid environment variables for meeting-api-gateway',
          );
        }
        return { ...config, ...result.data };
      },
    }),
    CustomConfigModule,
    SharedAuthenticationModule.forRoot(),
    LoggingModule.forRoot({
      serviceName: 'meeting-api-gateway',
      prettyPrint: process.env.NODE_ENV !== 'production',
    }),
    NatsModule,
    UsersModule,
    KafkaModule,
    ConversationsModule,

    KeyvCacheModule.forRootAsync({
      imports: [CustomConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<MeetingApiGatewayEnv>) => {
        const url = config.get('CACHE_REDIS_URL');
        const ttlMs = config.get('CACHE_TTL_MS');

        return {
          url,
          namespace: 'meeting-api-gateway',
          ttlMs,
        };
      },
      isGlobal: true,
    }),
  ],

  // TODO: remove this MeetingApiGatewayController after testing
  controllers: [MeetingApiGatewayController],
  providers: [
    MeetingApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class MeetingApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
