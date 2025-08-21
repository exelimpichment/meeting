import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MEETING_API_NATS_CLIENT } from './consts';

@Injectable()
export class MeetingApiGatewayService {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT) private meetingClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
