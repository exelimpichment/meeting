import { ConversationsService } from '@/apps/messenger/src/conversations/conversations.service';
import {
  EditConversationPayload,
  ReadConversationsPayload,
} from '@/libs/contracts/src/messenger/conversations.schema';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import {
  CONVERSATIONS_EDIT_PATTERN,
  CONVERSATIONS_GET_PATTERN,
} from '@/libs/contracts/patterns/conversations/CONSTANTS';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern(CONVERSATIONS_GET_PATTERN) // pattern: conversations.get
  async getConversationHandler(
    payload: ReadConversationsPayload,
  ): Promise<MessengerConversation[]> {
    return await this.conversationsService.getConversations(payload.userId);
  }

  @MessagePattern(CONVERSATIONS_EDIT_PATTERN) // pattern: conversations.edit
  async editConversationHandler(
    payload: EditConversationPayload,
  ): Promise<MessengerConversation> {
    return await this.conversationsService.editConversation(payload);
  }
}
