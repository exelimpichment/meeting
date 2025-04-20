import { IAmModule } from 'apps/meeting-api-gateway/src/iam/src/iam.module';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { envSchema } from './env.schema';
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
export class MeetingApiGatewayModule {}
