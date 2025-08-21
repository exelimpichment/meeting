import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { NatsModule } from './nats/nats.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RequestLoggerMiddleware } from './common';
import { UsersModule } from './users/users.module';
import { IAmModule } from './iam/src/iam.module';
import { jwtConfig } from './iam/jwt.config';
import { ConfigModule as LibsConfigModule } from '@libs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import {
  AccessTokenGuard,
  AuthenticationGuard,
} from './iam/src/authentication/guards';
import { MessengerModule } from './messenger/messenger.module';
import { meetingApiGatewayEnvSchema } from '../meeting-api-gateway.schema';
import { KafkaModule } from './kafka/kafka.module';

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
        return result.data;
      },
      load: [jwtConfig],
    }),
    LibsConfigModule,
    IAmModule,
    NatsModule,
    UsersModule,
    WebsocketModule,
    MessengerModule,
    KafkaModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [MeetingApiGatewayController],
  providers: [
    MeetingApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class MeetingApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
