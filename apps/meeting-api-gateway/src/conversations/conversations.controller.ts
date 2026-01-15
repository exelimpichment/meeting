import { ConversationsService } from '@/apps/meeting-api-gateway/src/conversations/conversations.service';
import { PatchConversationBody } from '@/libs/contracts/src/messenger/conversations.schema';
import { User } from '@/libs/shared-authentication/src/decorators/user.decorator';
import { SupabaseAuthUser } from '@/libs/shared-authentication/src/types';
import { MessengerConversation } from '@exelimpichment/prisma-types';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(
    @User() user: SupabaseAuthUser,
  ): Promise<MessengerConversation[]> {
    return this.conversationsService.getConversations(user.sub);
  }

  @Patch(':conversationId')
  async editConversation(
    @User() user: SupabaseAuthUser,
    @Param('conversationId') conversationId: string,
    @Body() body: PatchConversationBody,
  ): Promise<MessengerConversation> {
    console.log('here1');
    return this.conversationsService.editConversation(user.sub, {
      name: body.name,
      userId: user.sub,
      conversationId,
    });
  }
}
