import { AuthenticationModule } from './authentication/authentication.module';
import { IAmPrismaModule } from './prisma';
import { BcryptService } from '@libs/hashing/src/bcrypt.service';
import { HashingService } from '@libs/hashing/src';
import { ConfigModule as CustomConfigModule } from '@libs/config/src/config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CustomConfigModule, IAmPrismaModule, AuthenticationModule],
  providers: [{ provide: HashingService, useClass: BcryptService }],
  controllers: [],
  exports: [AuthenticationModule],
})
export class IAmModule {}
