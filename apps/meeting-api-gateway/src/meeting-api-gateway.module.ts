import { MeetingApiGatewayController } from '@apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { MeetingApiGatewayService } from '@apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { RequestLoggerMiddleware } from '@apps/meeting-api-gateway/src/common';
import { IAmModule } from 'apps/meeting-api-gateway/src/iam/src/iam.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'apps/meeting-api-gateway/src/iam/jwt.config';
import {
  AccessTokenGuard,
  AuthenticationGuard,
} from '@apps/meeting-api-gateway/src/iam/src/authentication/guards';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    IAmModule,
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ClientsModule.register([
      {
        name: 'MEETING_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    ]),
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
