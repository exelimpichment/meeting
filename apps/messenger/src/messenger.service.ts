import { Injectable } from '@nestjs/common';

import { DeleteMessageDto, SendMessageDto } from '@app/contracts/messenger';
import { EditMessageDto } from '@app/contracts/messenger/edit-message-dto';

@Injectable()
export class MessengerService {
  // constructor(private readonly prisma: PrismaService) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    const { groupId, userId, message } = sendMessageDto;
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    const { groupId, userId, messageId } = deleteMessageDto;
  }

  async editMessage(editMessageDto: EditMessageDto) {
    const { groupId, userId, messageId, message } = editMessageDto;
  }
}
