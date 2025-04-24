import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

import { UsersRepository } from './repositories/users.repository';
import { IAmPrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [IAmPrismaModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
