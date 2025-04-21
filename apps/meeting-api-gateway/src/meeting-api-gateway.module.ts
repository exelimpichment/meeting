import { MeetingApiGatewayController } from '@apps/meeting-api-gateway/src/meeting-api-gateway.controller';
import { MeetingApiGatewayService } from '@apps/meeting-api-gateway/src/meeting-api-gateway.service';
import { RequestLoggerMiddleware } from '@apps/meeting-api-gateway/src/common';
import { IAmModule } from 'apps/meeting-api-gateway/src/iam/src/iam.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { envSchema } from '@apps/meeting-api-gateway/src/env.schema';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule } from '@libs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting-api-gateway/.env',
      validate: (env) => envSchema.parse(env),
    }),
    ConfigModule,
    IAmModule,
  ],
  controllers: [MeetingApiGatewayController],
  providers: [MeetingApiGatewayService],
})
export class MeetingApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
