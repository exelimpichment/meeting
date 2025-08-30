import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageDeleteHandler {
  handle(user: any, message: string) {
    console.log(user, message);
  }
}
