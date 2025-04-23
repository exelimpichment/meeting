import { MeetingApiGatewayController } from '@apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { MeetingApiGatewayService } from '@apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { RequestLoggerMiddleware } from '@apps/meeting-api-gateway/src/common';
import { IAmModule } from 'apps/meeting-api-gateway/src/iam/src/iam.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from 'apps/meeting-api-gateway/src/iam/src/authentication/guards/access-token.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'apps/meeting-api-gateway/src/iam/jwt.config';

@Module({
  imports: [
    ConfigModule,
    IAmModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [MeetingApiGatewayController],
  providers: [
    MeetingApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class MeetingApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
