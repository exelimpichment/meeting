import { KafkaProducerService } from '@/apps/meeting-api-gateway/src/kafka/kafka.producer.service';
import { Logger } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthenticatedWebSocket } from '../../common/types';
import { WsAuthService } from '../../common/ws-auth.service';
import { WsUser } from '../../common/decorators/ws-user.decorator';
import { ActiveUserData } from '../../iam/src/interfaces/active-user-data.interface';

export const MessageEventType = {
  SEND: 'message.send',
  EDIT: 'message.edit',
  DELETE: 'message.delete',
} as const;

@WebSocketGateway({
  path: '/ws/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly wsAuthService: WsAuthService,
  ) {}

  @WebSocketServer()
  server: Server;

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
  handleMessage(@WsUser() user: ActiveUserData, message: string): void {
    const payload = {
      userId: user.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    console.log('payload', payload);
    // forward the message to the meeting service via Kafka
    // this.kafkaProducerService.send('messenger.send', payload);

    // echo back to the client
    // client.send(
    //   JSON.stringify({
    //     event: 'messageReceived',
    //     data: message,
    //   }),
    // );
  }

  @SubscribeMessage(MessageEventType.DELETE)
  handleMessageDelete(@WsUser() user: ActiveUserData, message: string): void {
    const payload = {
      userId: user.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    this.kafkaProducerService.send('messenger.delete', payload);

    // echo back to the client
    // client.send(
    //   JSON.stringify({
    //     event: 'messageReceived',
    //     data: message,
    //   }),
    // );
  }

  @SubscribeMessage(MessageEventType.EDIT)
  handleMessageEdit(@WsUser() user: ActiveUserData, message: string): void {
    const payload = {
      userId: user.sub,
      message,
      timestamp: new Date().toISOString(),
    };
    // forward the message to the meeting service via Kafka
    this.kafkaProducerService.send('messenger.edit', payload);

    // echo back to the client
    // client.send(
    //   JSON.stringify({
    //     event: 'messageReceived',
    //     data: message,
    //   }),
    // );
  }
}
