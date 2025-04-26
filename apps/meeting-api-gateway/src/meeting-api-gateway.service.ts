import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MeetingApiGatewayService {
  constructor(@Inject('MEETING_SERVICE') private meetingClient: ClientProxy) {}

  getHello(): string {
    return 'Hello World!';
  }
}
