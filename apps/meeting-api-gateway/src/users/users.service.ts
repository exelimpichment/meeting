import { UserDto } from '@/apps/meeting-api-gateway/src/dto/user.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MEETING_API_NATS_CLIENT } from '../constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT) private meetingClient: ClientProxy,
  ) {}

  async getUser(id: string): Promise<UserDto> {
    return await firstValueFrom<UserDto>(
      this.meetingClient.send<UserDto, { id: string }>('users.findOne', {
        id,
      }),
    );
  }
}
