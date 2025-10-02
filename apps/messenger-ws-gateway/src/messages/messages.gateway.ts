import { MessageDeleteHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-delete-handler';
import { MessageSendHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-send.handler';
import { MessageEditHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-edit.handler';
import { WebSocketExceptionFilter } from '@/apps/messenger-ws-gateway/src/filters/websocket-exception.filter';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { WsUser } from '@/libs/shared-authentication/src/decorators/ws-user.decorator';
import { MessageEventType } from '@/apps/messenger-ws-gateway/src/constants';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { z } from 'zod';
import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
} from '@/libs/contracts/src/messenger/messenger.schema';

import {
  AuthenticatedWebSocket,
  JwtPayload,
} from '@/libs/shared-authentication/src/types';

@WebSocketGateway({
  path: '/ws/messages',
})
@UseFilters(WebSocketExceptionFilter)
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
    @MessageBody() data: unknown,
  ) {
    const validatedData = this.validateDto(sendMessageSchema, data);
    return await this.messageSendHandler.handle(user, validatedData);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.EDIT)
  async handleMessageEdit(
    @WsUser() user: JwtPayload,
    @MessageBody() data: unknown,
  ): Promise<unknown> {
    const validatedData = this.validateDto(editMessageSchema, data);
    return await this.messageEditHandler.handle(user, validatedData);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.DELETE)
  async handleMessageDelete(
    @WsUser() user: JwtPayload,
    @MessageBody() data: unknown,
  ): Promise<unknown> {
    const validatedData = this.validateDto(deleteMessageSchema, data);
    return await this.messageDeleteHandler.handle(user, validatedData);
  }

  private validateDto<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    console.log('here');
    if (!result.success) {
      const errorMessage = result.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new WsException(`Validation failed: ${errorMessage}`);
    }
    return result.data;
  }
}
