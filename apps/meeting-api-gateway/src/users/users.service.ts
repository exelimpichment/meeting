import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('MEETING_SERVICE') private meetingClient: ClientProxy) {}

  async getUser(id: string): Promise<UserDto> {
    return await firstValueFrom<UserDto>(
      this.meetingClient.send<UserDto, { id: string }>('users.findOne', {
        id,
      }),
    );
  }
}
