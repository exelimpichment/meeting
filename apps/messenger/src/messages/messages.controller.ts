import { MessagesService } from '@apps/messenger/src/messages/messages.service';
import { DeleteMessageDto, SendMessageDto } from '@app/contracts/messenger';
import { EditMessageDto } from '@app/contracts/messenger/edit-message-dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { GetMessagesDto } from '@app/contracts/messenger/get-messages-dto';

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
