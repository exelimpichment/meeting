import { Auth } from '@/libs/shared-authentication/src/decorators/auth.decorator';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { AuthType } from '@app/shared-authentication/types';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class MeetingApiGatewayController {
  constructor(
    private readonly meetingApiGatewayService: MeetingApiGatewayService,
  ) {}

  @Auth(AuthType.None)
  @Get()
  getHello(): string {
    return this.meetingApiGatewayService.getHello();
  }
}
