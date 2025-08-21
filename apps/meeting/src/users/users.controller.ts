import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.findOne')
  getUser(data: { id: string }) {
    return this.usersService.getUser(data.id);
  }
}
