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

import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { MessageDeleteHandler } from './handlers/message-delete-handler';
import { MessageEditHandler } from './handlers/message-edit.handler';
import { MessageSendHandler } from './handlers/message-send.handler';
import { MessageSendDto } from './dto/message-send.dto';
import { MessageEditDto } from './dto/message-edit.dto';
import { MessageDeleteDto } from './dto/message-delete.dto';
import { AuthenticatedWebSocket } from '../types';
import { MessageEventType } from '../constants';
import { WsUser } from '../decorators/ws-user.decorator';

interface AuthenticatedUser {
  sub: string;
  [key: string]: unknown;
}

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
    @WsUser() user: AuthenticatedUser,
    @MessageBody() data: MessageSendDto,
  ) {
    return await this.messageSendHandler.handle(user, data);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.EDIT)
  async handleMessageEdit(
    @WsUser() user: AuthenticatedUser,
    @MessageBody() data: MessageEditDto,
  ): Promise<unknown> {
    return await this.messageEditHandler.handle(user, data);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.DELETE)
  async handleMessageDelete(
    @WsUser() user: AuthenticatedUser,
    @MessageBody() data: MessageDeleteDto,
  ): Promise<unknown> {
    return await this.messageDeleteHandler.handle(user, data);
  }
}
