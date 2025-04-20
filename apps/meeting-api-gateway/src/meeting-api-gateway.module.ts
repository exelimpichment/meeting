import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { ConfigModule } from '@app/config';
import { envSchema } from './env.schema';
import { IAmModule } from 'apps/meeting-api-gateway/src/iam/src/iam.module';

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
