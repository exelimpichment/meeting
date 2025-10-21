import { AuthenticationModule } from '@/apps/meeting-api-gateway/src/iam/src/authentication/authentication.module';
import { ConfigModule as CustomConfigModule } from '@libs/config/src/config.module';
import { IAmPrismaModule } from '@/apps/meeting-api-gateway/src/iam/src/prisma';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CustomConfigModule,
    IAmPrismaModule,
    AuthenticationModule,
    HashingModule,
  ],
  providers: [],
  controllers: [],
  exports: [AuthenticationModule, HashingModule],
})
export class IAmModule {}
