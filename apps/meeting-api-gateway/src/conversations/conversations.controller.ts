import { User } from '@/libs/shared-authentication/src/decorators/user.decorator';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { JwtPayload } from '@/libs/shared-authentication/src/types';
import { ConversationsService } from './conversations.service';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PatchConversationBody } from '@/libs/contracts/src/messenger/conversations.schema';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(
    @User() user: JwtPayload,
  ): Promise<MessengerConversation[]> {
    return this.conversationsService.getConversations(user.sub);
  }

  @Patch(':conversationId')
  async editConversation(
    @User() user: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() body: PatchConversationBody,
  ): Promise<MessengerConversation> {
    return this.conversationsService.editConversation(user.sub, {
      name: body.name,
      userId: user.sub,
      conversationId,
    });
  }
}
