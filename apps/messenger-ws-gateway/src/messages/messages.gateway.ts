import { Logger, UseGuards } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { WsUser } from '@/apps/meeting-api-gateway/src/common/decorators/ws-user.decorator';
import { WsAuthService } from '@/libs/shared-authentication/src/services/ws-auth.service';
import { MessageDeleteHandler } from './handlers/message-delete-handler';
import { MessageEditHandler } from './handlers/message-edit.handler';
import { MessageSendHandler } from './handlers/message-send.handler';
import { AuthenticatedWebSocket } from '../types';
import { MessageEventType } from '../constants';

@WebSocketGateway({
  path: '/ws/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly wsAuthService: WsAuthService,
    private messageSendHandler: MessageSendHandler,
    private messageEditHandler: MessageEditHandler,
    private messageDeleteHandler: MessageDeleteHandler,
  ) {}

  @WebSocketServer()
  server: Server;

  @UseGuards(AuthenticationGuard)
  async handleConnection(
    client: AuthenticatedWebSocket,
    request: IncomingMessage,
  ): Promise<void> {
    await this.wsAuthService.authenticate(client, request);
  }

  handleDisconnect(client: AuthenticatedWebSocket): void {
    this.logger.log(
      `client disconnected: ${client.user?.sub || 'not authenticated'}`,
    );
  }

  @SubscribeMessage(MessageEventType.SEND)
  handleMessage(@WsUser() user: any, message: string) {
    return this.messageSendHandler.handle(user, message);
  }

  @SubscribeMessage(MessageEventType.EDIT)
  handleMessageEdit(@WsUser() user: any, message: string) {
    return this.messageEditHandler.handle(user, message);
  }

  @SubscribeMessage(MessageEventType.DELETE)
  handleMessageDelete(@WsUser() user: any, message: string) {
    return this.messageDeleteHandler.handle(user, message);
  }

  // @SubscribeMessage(MessageEventType.SEND)
  // handleMessage(@WsUser() user: ActiveUserData, message: string): void {
  //   const payload = {
  //     userId: user.sub,
  //     message,
  //     timestamp: new Date().toISOString(),
  //   };
  //   console.log('payload', payload);
  //   // forward the message to the meeting service via Kafka
  //   this.kafkaProducerService.send('messenger.send', payload);

  //   // echo back to the client
  //   client.send(
  //     JSON.stringify({
  //       event: 'messageReceived',
  //       data: message,
  //     }),
  //   );
  // }

  // @SubscribeMessage(MessageEventType.DELETE)
  // handleMessageDelete(@WsUser() user: ActiveUserData, message: string): void {
  //   const payload = {
  //     userId: user.sub,
  //     message,
  //     timestamp: new Date().toISOString(),
  //   };
  //   // forward the message to the meeting service via Kafka
  //   this.kafkaProducerService.send('messenger.delete', payload);

  //   // echo back to the client
  //   client.send(
  //     JSON.stringify({
  //       event: 'messageReceived',
  //       data: message,
  //     }),
  //   );
  // }

  // @SubscribeMessage(MessageEventType.EDIT)
  // handleMessageEdit(@WsUser() user: ActiveUserData, message: string): void {
  //   const payload = {
  //     userId: user.sub,
  //     message,
  //     timestamp: new Date().toISOString(),
  //   };
  //   // forward the message to the meeting service via Kafka
  //   this.kafkaProducerService.send('messenger.edit', payload);

  //   // echo back to the client
  //   client.send(
  //     JSON.stringify({
  //       event: 'messageReceived',
  //       data: message,
  //     }),
  //   );
  // }
}
