import {
  EditConversationPayload,
  ReadConversationsPayload,
} from '@/libs/contracts/src/messenger/conversations.schema';
import {
  ConversationWithMessage,
  MessengerConversation,
} from '@exelimpichment/prisma-types';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/constants';
import { KeyvCacheService } from '@/libs/cache';
import {
  CONVERSATIONS_EDIT_PATTERN,
  CONVERSATIONS_GET_PATTERN,
} from '@/libs/contracts/patterns/conversations/CONSTANTS';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT) private readonly natsClient: ClientProxy,
    private readonly keyvCacheService: KeyvCacheService,
  ) {}

  async getConversations(userId: string): Promise<ConversationWithMessage[]> {
    const payload = { userId };

    const cachedConversationWithMessages = await this.keyvCacheService.get<
      ConversationWithMessage[]
    >(`user:${userId}:conversations`);

    console.log(
      'cachedConversationWithMessages',
      cachedConversationWithMessages,
    );

    if (cachedConversationWithMessages) {
      return cachedConversationWithMessages;
    }

    const conversationWithMessages = await firstValueFrom(
      this.natsClient.send<ConversationWithMessage[], ReadConversationsPayload>(
        CONVERSATIONS_GET_PATTERN,
        payload,
      ),
    );

    await this.keyvCacheService.set<ConversationWithMessage[]>(
      `user:${userId}:conversations`,
      conversationWithMessages,
      300000,
    );

    return conversationWithMessages;
  }

  async editConversation(
    userId: string,
    args: EditConversationPayload,
  ): Promise<MessengerConversation> {
    return await firstValueFrom(
      this.natsClient.send<MessengerConversation, EditConversationPayload>(
        CONVERSATIONS_EDIT_PATTERN,
        { ...args, userId },
      ),
    );
  }
}
