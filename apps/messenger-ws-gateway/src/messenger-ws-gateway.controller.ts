import { Controller, Get } from '@nestjs/common';
import { MessengerWsGatewayService } from './messenger-ws-gateway.service';

@Controller()
export class MessengerWsGatewayController {
  constructor(
    private readonly messengerWsGatewayService: MessengerWsGatewayService,
  ) {}

  @Get()
  getHello(): string {
    return this.messengerWsGatewayService.getHello();
  }
}
