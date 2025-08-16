import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from '../dto/user.dto';
import { Auth } from '@apps/meeting-api-gateway/src/iam/src/authentication/decorators/auth.decorator';
import { AuthType } from '@apps/meeting-api-gateway/src/iam/src/authentication/enums';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Auth(AuthType.None)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getUser(id);
  }
}
