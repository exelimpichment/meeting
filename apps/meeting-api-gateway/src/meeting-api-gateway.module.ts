// import { ConfigModule as CustomConfigModule } from '@libs/config/src/config.module';
import { meetingApiGatewayEnvSchema } from '../meeting-api-gateway.schema';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { Module, NestModule } from '@nestjs/common';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
// import { UsersModule } from './users/users.module';
import { KafkaModule } from './kafka/kafka.module';
// import { IAmModule } from './iam/src/iam.module';
import { NatsModule } from './nats/nats.module';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.cwd() + '/apps/meeting-api-gateway/.env.meeting-api-gateway',
      validate: (config) => {
        const result = meetingApiGatewayEnvSchema.safeParse(config);

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
    // IAmModule,
    NatsModule,
    // UsersModule,
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
  configure() {
    // consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
