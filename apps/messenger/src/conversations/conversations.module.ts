import { ConversationsController } from '@apps/messenger/src/conversations/conversations.controller';
import { ConversationsService } from '@apps/messenger/src/conversations/conversations.service';
import { MessengerPrismaModule } from '@apps/messenger/src/prisma/messenger-prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MessengerPrismaModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
