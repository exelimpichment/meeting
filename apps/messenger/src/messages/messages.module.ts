import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessengerPrismaModule } from '../prisma/messenger-prisma.module';

@Module({
  imports: [MessengerPrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
