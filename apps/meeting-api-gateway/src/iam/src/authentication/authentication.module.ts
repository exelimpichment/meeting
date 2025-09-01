import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { Module } from '@nestjs/common';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';

@Module({
  imports: [UsersModule, HashingModule, SharedAuthenticationModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
