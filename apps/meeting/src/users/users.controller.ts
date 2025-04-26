import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('meeting.getUser')
  getUser(data: { id: string }) {
    return this.usersService.getUser(data.id);
  }
}
