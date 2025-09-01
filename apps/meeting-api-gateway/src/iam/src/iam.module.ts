import { ConfigModule as CustomConfigModule } from '@libs/config/src/config.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { HashingModule } from '@libs/hashing/src/hashing.module';
import { IAmPrismaModule } from './prisma';
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
})
export class IAmModule {}
