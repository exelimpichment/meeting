import { WritingMessageDto } from '@app/contracts/messenger';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeleteMessageDto } from '@app/contracts/messenger';
import { Payload } from '@nestjs/microservices';
import { MessengerService } from './messenger.service';
import { SendMessageDto } from '@app/contracts/messenger';
import { EditMessageDto } from '@app/contracts/messenger/edit-message-dto';

@Controller()
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  @MessagePattern('messenger.send')
  sendMessageHandler(@Payload() sendMessageDto: SendMessageDto) {
    return 'hello';
  }

  @MessagePattern('messenger.delete')
  deleteMessageHandler(@Payload() deleteMessageDto: DeleteMessageDto) {}

  @MessagePattern('messenger.edit')
  editMessageHandler(@Payload() editMessageDto: EditMessageDto) {}

  @MessagePattern('messenger.writing')
  writingMessageHandler(@Payload() writingMessageDto: WritingMessageDto) {
    return 'hello';
  }

  @MessagePattern('messenger.stopWriting')
  stopWritingMessageHandler(@Payload() writingMessageDto: WritingMessageDto) {
    console.log('HERE!!');

    return 'hello';
  }
}
