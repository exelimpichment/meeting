import { RefreshTokensRepository } from '@/apps/meeting-api-gateway/src/iam/src/refresh-tokens/refresh-tokens.repository';
import { AuthenticationController } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.controller';
import { AuthenticationService } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.service';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { UsersModule } from '@/apps/meeting-api-gateway/src/iam/src/users/users.module';
import { IAmPrismaModule } from '@/apps/meeting-api-gateway/src/iam/src/prisma';
import { HashingModule } from '@app/hashing';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    HashingModule,
    SharedAuthenticationModule,
    IAmPrismaModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, RefreshTokensRepository],
  exports: [RefreshTokensRepository],
})
export class AuthenticationModule {}
