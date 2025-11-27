import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { PatchConversationBody } from '@/libs/contracts/src/messenger/conversations.schema';
import { User } from '@/libs/shared-authentication/src/decorators/user.decorator';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { JwtPayload } from '@/libs/shared-authentication/src/types';

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
