import { ConversationsService } from '@apps/messenger/src/conversations/conversations.service';
import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

interface GetConversationsPayload {
  userId: string;
}

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('conversation.get')
  async getConversationHandler(payload: GetConversationsPayload) {
    return this.conversationsService.getConversations(payload.userId);
  }
}
