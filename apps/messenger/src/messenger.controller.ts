import { EditMessageDto } from '@app/contracts/messenger/edit-message-dto';
import { DeleteMessageDto } from '@app/contracts/messenger';
import { SendMessageDto } from '@app/contracts/messenger';
import { MessagePattern } from '@nestjs/microservices';
import { MessengerService } from './messenger.service';
import { Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

@Controller()
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  @MessagePattern('message.send')
  sendMessageHandler(@Payload() sendMessageDto: SendMessageDto) {
    // return this.messengerService.sendMessage(sendMessageDto);
    console.log('message.send');
  }

  @MessagePattern('message.delete')
  deleteMessageHandler(@Payload() deleteMessageDto: DeleteMessageDto) {
    // return this.messengerService.deleteMessage(deleteMessageDto);
    console.log('message.delete');
  }

  @MessagePattern('message.edit')
  editMessageHandler(@Payload() editMessageDto: EditMessageDto) {
    // return this.messengerService.editMessage(editMessageDto);
    console.log('message.edit');
  }
}
