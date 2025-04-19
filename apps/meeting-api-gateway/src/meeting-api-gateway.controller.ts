import { Controller, Get } from '@nestjs/common';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';

@Controller()
export class MeetingApiGatewayController {
  constructor(
    private readonly meetingApiGatewayService: MeetingApiGatewayService,
  ) {}

  @Get()
  getHello(): string {
    return this.meetingApiGatewayService.getHello();
  }
}
