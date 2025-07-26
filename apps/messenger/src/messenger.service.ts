import { DeleteMessageDto, SendMessageDto } from '@app/contracts/messenger';
import { EditMessageDto } from '@app/contracts/messenger/edit-message-dto';
import { MessengerPrismaService } from './prisma/messenger-prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessengerService {
  constructor(private readonly prisma: MessengerPrismaService) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    const { groupId, userId, message } = sendMessageDto;
    return await this.prisma.messages.create({
      data: {
        content: message,
        conversation_id: groupId,
        user_id: userId,
      },
    });
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    const { groupId, userId, messageId } = deleteMessageDto;
    return await this.prisma.messages.delete({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
    });
  }

  async editMessage(editMessageDto: EditMessageDto) {
    const { groupId, userId, messageId, message } = editMessageDto;
    return await this.prisma.messages.update({
      where: {
        id: messageId,
        conversation_id: groupId,
        user_id: userId,
      },
      data: { content: message },
    });
  }
}
