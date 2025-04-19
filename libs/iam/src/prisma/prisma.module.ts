import { Module } from '@nestjs/common';
import { IAmPrismaService } from './prisma.service';

@Module({
  providers: [IAmPrismaService],
  exports: [IAmPrismaService],
})
export class IAmPrismaModule {}
