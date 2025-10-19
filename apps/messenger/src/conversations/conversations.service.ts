import { MessengerPrismaService } from '@/apps/messenger/src/prisma/messenger-prisma.service';
import { EditConversationPayload } from '@/libs/contracts/src/messenger/conversations.schema';
import { KeyvCacheService } from '@/libs/cache';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: MessengerPrismaService,
    private readonly keyvCacheService: KeyvCacheService,
  ) {}

  async getConversations(userId: string) {
    return this.prisma.conversations.findMany({
      where: {
        users_conversations: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });
  }

  async editConversation(payload: EditConversationPayload) {
    const { userId, conversationId, name } = payload;

    const updatedConversation = await this.prisma.conversations.update({
      where: {
        id: conversationId,
        users_conversations: { some: { user_id: userId } },
      },
      data: { name },
    });

    const conversationUsers = await this.prisma.users_conversations.findMany({
      where: {
        conversation_id: conversationId,
      },
    });

    await Promise.all(
      conversationUsers.map((u) =>
        this.keyvCacheService.del(`user:${u.user_id}:conversations`),
      ),
    );

    return updatedConversation;
  }
}
