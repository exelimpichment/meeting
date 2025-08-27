import { MEETING_API_NATS_CLIENT } from '@/apps/meeting-api-gateway/src/consts';
import { AuthType } from '@/apps/meeting-api-gateway/src/iam/src/authentication/enums/auth-type.enums';
import { Auth } from '@/apps/meeting-api-gateway/src/iam/src/authentication/decorators/auth.decorator';
import { User } from '@/apps/meeting-api-gateway/src/iam/src/authentication/decorators/user.decorator';
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface ConversationResponse {
  // define the expected response structure from the microservice
  [key: string]: unknown;
}

interface GetConversationsPayload {
  userId: string;
}

@Controller('conversations')
export class ConversationsController {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT)
    private readonly natsClient: ClientProxy,
  ) {}

  @Auth(AuthType.Bearer)
  @Get('/')
  async getConversationDetails(@User() user: Record<string, unknown>) {
    const userId = user?.sub as string;

    const response = await firstValueFrom(
      this.natsClient.send<ConversationResponse, GetConversationsPayload>(
        'conversation.get',
        { userId },
      ),
    );

    return response;
  }
}
