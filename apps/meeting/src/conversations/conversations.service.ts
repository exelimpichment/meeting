import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  @EventPattern('client.message')
  handleClientMessage(data: { message: string; timestamp: string }) {
    this.logger.log(`Received message: ${data.message} at ${data.timestamp}`);
  }
}
