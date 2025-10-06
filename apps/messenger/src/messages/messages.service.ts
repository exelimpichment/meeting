import { MessengerPrismaService } from '@/apps/messenger/src/prisma/messenger-prisma.service';
import { NatsService } from '@/apps/messenger/src/nats/nats.service';
import { Injectable } from '@nestjs/common';

import {
  KafkaDeleteMessageDto,
  KafkaEditMessageDto,
  KafkaSendMessageDto,
} from '@/libs/contracts/src/messenger/messenger.schema';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: MessengerPrismaService,
    private readonly nats: NatsService,
  ) {}

  async sendMessage(
    sendMessageDto: Omit<KafkaSendMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, message } = sendMessageDto;
    const created = await this.prisma.messages.create({
      data: {
        content: message,
        conversation_id: groupId,
        user_id: userId,
      },
    });

    this.nats.publish(`messenger.conversation.${groupId}`, {
      event: 'message.created',
      conversationId: groupId,
      message: {
        id: created.id,
        content: created.content,
        userId: created.user_id,
        createdAt: created.created_at,
      },
    });
    return created;
  }

  async deleteMessage(
    deleteMessageDto: Omit<KafkaDeleteMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, messageId } = deleteMessageDto;
    const deleted = await this.prisma.messages.delete({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
    });
    this.nats.publish(`messenger.conversation.${groupId}`, {
      event: 'message.deleted',
      conversationId: groupId,
      message: {
        id: messageId,
        userId,
      },
    });
    return deleted;
  }

  async editMessage(
    editMessageDto: Omit<KafkaEditMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, messageId, message } = editMessageDto;
    const updated = await this.prisma.messages.update({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
      data: { content: message },
    });
    this.nats.publish(`messenger.conversation.${groupId}`, {
      event: 'message.edited',
      conversationId: groupId,
      message: {
        id: updated.id,
        content: updated.content,
        userId: updated.user_id,
        updatedAt: updated.updated_at,
      },
    });
    return updated;
  }

  // async getMessageByConversationId(getMessagesDto: GetMessagesDto) {
  //   return this.prisma.messages.findMany({
  //     where: {
  //       conversation_id: getMessagesDto.conversationId,
  //     },
  //     include: {
  //       users: true,
  //     },
  //   });
  // }
}
