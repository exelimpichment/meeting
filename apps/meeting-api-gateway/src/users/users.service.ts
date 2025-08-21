import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/consts';
import { UserDto } from '@/apps/meeting-api-gateway/src/dto/user.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
