import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { HashingModule } from '@libs/hashing/src';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule, HashingModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
