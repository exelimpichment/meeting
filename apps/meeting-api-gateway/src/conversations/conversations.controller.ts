import { User } from '@/libs/shared-authentication/src/decorators/user.decorator';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
import { ConversationsService } from './conversations.service';
import { Controller, Get } from '@nestjs/common';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(
    @User() user: JwtPayload,
  ): Promise<MessengerConversation[]> {
    return this.conversationsService.getConversations(user.sub);
  }
}
