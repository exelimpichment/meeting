import { MeetingApiGatewayController } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { ConversationsModule } from '@/apps/meeting-api-gateway/src/conversations/conversations.module';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { MeetingApiGatewayService } from '@/apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { jwtEnvSchema } from '@/libs/shared-authentication/src/configs/jwt-env.schema';
import { UsersModule } from '@/apps/meeting-api-gateway/src/users/users.module';
import { KafkaModule } from '@/apps/meeting-api-gateway/src/kafka/kafka.module';
import { IAmModule } from '@/apps/meeting-api-gateway/src/iam/src/iam.module';
import { NatsModule } from '@/apps/meeting-api-gateway/src/nats/nats.module';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ContextMiddleware, RequestLoggerMiddleware } from '@app/logging';
import { ConfigService as AppConfigService } from '@config/config.service';
import { ConfigModule as AppConfigModule } from '@config/config.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LoggingModule } from '@app/logging/logging.module';
import { SharedCacheModule } from '@app/caching';
import { APP_GUARD } from '@nestjs/core';
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
        const mergedSchemas = meetingApiGatewayEnvSchema.merge(jwtEnvSchema);

        const result = mergedSchemas.safeParse(config);

        if (!result.success) {
          console.error(
            'Environment validation error:',
            result.error.flatten().fieldErrors,
          );
          throw new Error(
            'Invalid environment variables for meeting-api-gateway',
          );
        }
        return { ...config, ...result.data };
      },
    }),
    // CustomConfigModule,
    SharedAuthenticationModule.forRoot(),

    LoggingModule.forRoot({
      serviceName: 'meeting-api-gateway',
      prettyPrint: process.env.NODE_ENV !== 'production',
    }),

    AppConfigModule,

    SharedCacheModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService<MeetingApiGatewayEnv>) => ({
        url: cfg.get('REDIS_URL'),
        ttlMs: cfg.get('CACHE_TTL_MS') ?? 60_000,
        keyPrefix: 'meeting:gw:',
      }),
    }),

    IAmModule,
    NatsModule,
    UsersModule,
    KafkaModule,
    ConversationsModule,
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
