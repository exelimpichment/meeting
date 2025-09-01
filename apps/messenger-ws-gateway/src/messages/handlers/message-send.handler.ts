import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageSendHandler {
  handle(user: any, message: string) {
    console.log(user, message);
  }
}
