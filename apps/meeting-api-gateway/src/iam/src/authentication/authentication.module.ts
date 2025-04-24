import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { HashingModule } from '@libs/hashing/src';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@apps/meeting-api-gateway/src/iam/jwt.config';

@Module({
  imports: [
    UsersModule,
    HashingModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [JwtModule],
})
export class AuthenticationModule {}
