import { MessengerPrismaService } from '@/apps/messenger/src/prisma/messenger-prisma.service';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: MessengerPrismaService) {}

  async getConversations(userId: string): Promise<MessengerConversation[]> {
    return this.prisma.conversations.findMany({
      where: {
        users_conversations: {
          some: {
            user_id: userId,
          },
        },
      },
    });
  }
}
