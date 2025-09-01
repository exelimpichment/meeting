import { Injectable } from '@nestjs/common';

@Injectable()
export class MessengerWsGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
