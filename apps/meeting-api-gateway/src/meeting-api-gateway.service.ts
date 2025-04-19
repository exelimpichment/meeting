import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetingApiGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
