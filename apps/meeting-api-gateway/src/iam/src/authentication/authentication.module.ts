import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { jwtConfig } from '../../jwt.config';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { ConfigModule } from '@libs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    HashingModule,
    ConfigModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AccessTokenGuard],
  exports: [JwtModule, AccessTokenGuard],
})
export class AuthenticationModule {}
