import { Controller, Get } from '@nestjs/common';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { Auth } from './iam/src/authentication/decorators/auth.decorator';
import { AuthType } from './iam/src/authentication/enums';

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
