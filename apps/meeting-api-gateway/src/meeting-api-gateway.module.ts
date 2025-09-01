import { meetingApiGatewayEnvSchema } from '../meeting-api-gateway.schema';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { KafkaModule } from './kafka/kafka.module';
import { IAmModule } from './iam/src/iam.module';
import { NatsModule } from './nats/nats.module';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { LoggingModule } from '@app/logging/logging.module';
import { RequestLoggerMiddleware } from '../../../libs/logging/src/middleware/request-logger.middleware';
import { jwtEnvSchema } from '@/libs/shared-authentication/src/configs/jwt-env.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.cwd() + '/apps/meeting-api-gateway/.env.meeting-api-gateway',
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
    LoggingModule,
    IAmModule,
    NatsModule,
    UsersModule,
    KafkaModule,
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
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
