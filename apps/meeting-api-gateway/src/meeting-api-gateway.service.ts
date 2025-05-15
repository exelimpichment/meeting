import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MEETING_SERVICE } from '@apps/meeting-api-gateway/src/consts';

@Injectable()
export class MeetingApiGatewayService {
  constructor(@Inject(MEETING_SERVICE) private meetingClient: ClientProxy) {}

  getHello(): string {
    return 'Hello World!';
  }
}
