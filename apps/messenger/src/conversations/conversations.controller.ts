import { ConversationsService } from '@/apps/messenger/src/conversations/conversations.service';
import { ReadConversationsPayload } from '@/libs/contracts/src/messenger/conversations.schema';
import { CONVERSATIONS_GET_PATTERN } from '@/apps/messenger/constants';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern(CONVERSATIONS_GET_PATTERN) // pattern: conversations.get
  async getConversationHandler(
    payload: ReadConversationsPayload,
  ): Promise<MessengerConversation[]> {
    return await this.conversationsService.getConversations(payload.userId);
  }
}
