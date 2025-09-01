import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from '../dto/user.dto';
import { AuthType } from '@/libs/shared-authentication/src/types';
import { Auth } from '@/libs/shared-authentication/src/decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Auth(AuthType.None)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getUser(id);
  }
}
