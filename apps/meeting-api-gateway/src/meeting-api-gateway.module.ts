import { Module } from '@nestjs/common';
import { MeetingApiGatewayController } from './meeting-api-gateway.controller';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';

@Module({
  imports: [],
  controllers: [MeetingApiGatewayController],
  providers: [MeetingApiGatewayService],
})
export class MeetingApiGatewayModule {}
