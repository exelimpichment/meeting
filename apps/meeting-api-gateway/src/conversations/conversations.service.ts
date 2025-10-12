import { ReadConversationsPayload } from '@/libs/contracts/src/messenger/conversations.schema';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MEETING_API_NATS_CLIENT,
  CONVERSATIONS_GET_PATTERN,
} from '@/apps/meeting-api-gateway/src/constants';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT) private readonly natsClient: ClientProxy,
  ) {}

  async getConversations(userId: string): Promise<MessengerConversation[]> {
    const payload = { userId };

    return await firstValueFrom(
      this.natsClient.send<MessengerConversation[], ReadConversationsPayload>(
        CONVERSATIONS_GET_PATTERN,
        payload,
      ),
    );
  }
}
