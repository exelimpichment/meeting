import { DeleteMessageDto } from '@/libs/contracts/src/messenger/delete-message-dto';
import { SendMessageDto } from '@/libs/contracts/src/messenger/send-message-dto';
import { GetMessagesDto } from '@/libs/contracts/src/messenger/get-messages-dto';
import { EditMessageDto } from '@/libs/contracts/src/messenger/edit-message-dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagesService } from './messages.service';
import { Controller } from '@nestjs/common';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @MessagePattern('message.send')
  sendMessageHandler(@Payload() sendMessageDto: SendMessageDto) {
    // forward to service layer
    return this.messagesService.sendMessage(sendMessageDto);
  }

  @MessagePattern('message.delete')
  deleteMessageHandler(@Payload() deleteMessageDto: DeleteMessageDto) {
    return this.messagesService.deleteMessage(deleteMessageDto);
  }

  @MessagePattern('message.edit')
  editMessageHandler(@Payload() editMessageDto: EditMessageDto) {
    return this.messagesService.editMessage(editMessageDto);
  }

  @MessagePattern('messages.get')
  getMessageHandler(@Payload() getMessagesDto: GetMessagesDto) {
    return this.messagesService.getMessageByConversationId(getMessagesDto);
  }
}
