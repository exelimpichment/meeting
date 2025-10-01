import { MessageDeleteHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-delete-handler';
import { MessageSendHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-send.handler';
import { MessageEditHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-edit.handler';
import { MessageDeleteDto } from '@/apps/messenger-ws-gateway/src/messages/dto/message-delete.dto';
import { MessageSendDto } from '@/apps/messenger-ws-gateway/src/messages/dto/message-send.dto';
import { MessageEditDto } from '@/apps/messenger-ws-gateway/src/messages/dto/message-edit.dto';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { WsUser } from '@/libs/shared-authentication/src/decorators/ws-user.decorator';
import { MessageEventType } from '@/apps/messenger-ws-gateway/src/constants';
import { Logger, UseGuards } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';

import {
  AuthenticatedWebSocket,
  JwtPayload,
} from '@/libs/shared-authentication/src/types';

@WebSocketGateway({
  path: '/ws/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private messageSendHandler: MessageSendHandler,
    private messageEditHandler: MessageEditHandler,
    private messageDeleteHandler: MessageDeleteHandler,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(
    client: AuthenticatedWebSocket,
    request: IncomingMessage,
  ): void {
    void client;
    void request;
    this.logger.log('client connected!');
  }

  handleDisconnect(client: AuthenticatedWebSocket): void {
    this.logger.log(
      `client disconnected: ${client.user?.sub || 'not authenticated'}`,
    );
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.SEND)
  async handleMessage(
    @WsUser() user: JwtPayload,
    @MessageBody() data: MessageSendDto,
  ) {
    return await this.messageSendHandler.handle(user, data);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.EDIT)
  async handleMessageEdit(
    @WsUser() user: JwtPayload,
    @MessageBody() data: MessageEditDto,
  ): Promise<unknown> {
    return await this.messageEditHandler.handle(user, data);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.DELETE)
  async handleMessageDelete(
    @WsUser() user: JwtPayload,
    @MessageBody() data: MessageDeleteDto,
  ): Promise<unknown> {
    return await this.messageDeleteHandler.handle(user, data);
  }
}
