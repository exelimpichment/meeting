import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/consts';
import { AuthType } from '@/apps/meeting-api-gateway/src/iam/src/authentication/enums/auth-type.enums';
import { Auth } from '@/apps/meeting-api-gateway/src/iam/src/authentication/decorators/auth.decorator';
import { User } from '@/apps/meeting-api-gateway/src/iam/src/authentication/decorators/user.decorator';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface MessageResponse {
  // define the expected response structure from the microservice
  [key: string]: unknown;
}

interface GetMessagesPayload {
  conversationId: string;
  userId: string;
}

@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT)
    private readonly natsClient: ClientProxy,
  ) {}

  @Auth(AuthType.Bearer)
  @Get('/')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @User() user: Record<string, unknown>,
  ) {
    const userId = user?.sub as string;
    console.log({ conversationId, userId });

    const response = await firstValueFrom(
      this.natsClient.send<MessageResponse[], GetMessagesPayload>(
        'messages.get',
        { conversationId, userId },
      ),
    );

    return response;
  }
}
