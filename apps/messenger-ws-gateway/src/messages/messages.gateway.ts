import { ConversationSubscriptionsService } from '@/apps/messenger-ws-gateway/src/messages/conversation-subscriptions.service';
import { MessageDeleteHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-delete-handler';
import { MessageSendHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-send.handler';
import { MessageEditHandler } from '@/apps/messenger-ws-gateway/src/messages/handlers/message-edit.handler';
import { WebSocketExceptionFilter } from '@/apps/messenger-ws-gateway/src/filters/websocket-exception.filter';
import { AuthenticationGuard } from '@/libs/shared-authentication/src/guards/authentication.guard';
import { validateDto } from '@/apps/messenger-ws-gateway/src/messages/utils/dto-validator';
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
} from '@nestjs/websockets';
// zod used in validator util; no direct usage here
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
    private readonly conversationSubscriptionsService: ConversationSubscriptionsService,
  ) {}

  @WebSocketServer()
  server: Server;

  // state and pub/sub logic moved to ConversationSubscriptionsService

  handleConnection(
    client: AuthenticatedWebSocket,
    request: IncomingMessage,
  ): void {
    const url = new URL(
      request.url ?? '',
      `http://${request.headers.host ?? 'localhost'}`,
    );
    const conversationId = url.searchParams.get('conversation_id');

    if (!conversationId) {
      client.close();
      return;
    }

    this.conversationSubscriptionsService.addSocket(conversationId, client);
    this.logger.log('client connected!');
  }

  handleDisconnect(client: AuthenticatedWebSocket): void {
    this.conversationSubscriptionsService.removeSocket(client);

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
    const validatedData = validateDto(sendMessageSchema, data);
    return await this.messageSendHandler.handle(user, validatedData);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.EDIT)
  async handleMessageEdit(
    @WsUser() user: JwtPayload,
    @MessageBody() data: unknown,
  ): Promise<unknown> {
    const validatedData = validateDto(editMessageSchema, data);
    return await this.messageEditHandler.handle(user, validatedData);
  }

  @UseGuards(AuthenticationGuard)
  @SubscribeMessage(MessageEventType.DELETE)
  async handleMessageDelete(
    @WsUser() user: JwtPayload,
    @MessageBody() data: unknown,
  ): Promise<unknown> {
    const validatedData = validateDto(deleteMessageSchema, data);
    return await this.messageDeleteHandler.handle(user, validatedData);
  }
}
