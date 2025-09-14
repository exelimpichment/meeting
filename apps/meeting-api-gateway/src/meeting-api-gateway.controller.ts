import { Auth } from '@/libs/shared-authentication/src/decorators/auth.decorator';
import { MeetingApiGatewayService } from './meeting-api-gateway.service';
import { AuthType } from '@app/shared-authentication/types';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class MeetingApiGatewayController {
  constructor(
    private readonly meetingApiGatewayService: MeetingApiGatewayService,
  ) {}

  // Should only answer: “Is the process healthy enough to keep running?”
  // implement some lightweight check.
  @Auth(AuthType.None)
  @Get('health')
  health() {
    return this.meetingApiGatewayService.health();
  }
}
