import { Module } from '@nestjs/common';
import { MessengerPrismaService } from './messenger-prisma.service';

@Module({
  providers: [MessengerPrismaService],
  exports: [MessengerPrismaService],
})
export class MessengerPrismaModule {}
