import { MessengerPrismaService } from '@apps/messenger/src/prisma/messenger-prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: MessengerPrismaService) {}

  async getConversations(userId: string) {
    console.log('getConversations', userId);

    const conversations = await this.prisma.conversations.findMany({
      where: {
        users_conversations: {
          some: {
            user_id: userId,
          },
        },
      },
    });

    return conversations;
  }
}
