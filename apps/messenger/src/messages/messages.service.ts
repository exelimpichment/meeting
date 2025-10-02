import { MessengerPrismaService } from '@/apps/messenger/src/prisma/messenger-prisma.service';
import { Injectable } from '@nestjs/common';

import {
  KafkaDeleteMessageDto,
  KafkaEditMessageDto,
  KafkaSendMessageDto,
} from '@/libs/contracts/src/messenger/messenger.schema';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: MessengerPrismaService) {}

  async sendMessage(
    sendMessageDto: Omit<KafkaSendMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, message } = sendMessageDto;
    return this.prisma.messages.create({
      data: {
        content: message,
        conversation_id: groupId,
        user_id: userId,
      },
    });
  }

  async deleteMessage(
    deleteMessageDto: Omit<KafkaDeleteMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, messageId } = deleteMessageDto;
    return this.prisma.messages.delete({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
    });
  }

  async editMessage(
    editMessageDto: Omit<KafkaEditMessageDto, 'timestamp' | 'source'>,
  ) {
    const { groupId, userId, messageId, message } = editMessageDto;
    return this.prisma.messages.update({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
      data: { content: message },
    });
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
