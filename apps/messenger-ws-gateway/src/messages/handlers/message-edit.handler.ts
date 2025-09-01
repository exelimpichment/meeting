import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageEditHandler {
  handle(user: any, message: string) {
    console.log(user, message);
  }
}
