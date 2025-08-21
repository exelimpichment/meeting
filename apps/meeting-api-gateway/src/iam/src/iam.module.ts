import { AuthenticationModule } from './authentication';
import { IAmPrismaModule } from './prisma';
import { jwtConfig } from '../jwt.config';
import { BcryptService } from '@libs/hashing/src/bcrypt.service';
import { HashingService } from '@libs/hashing/src';
import { ConfigModule } from '@libs/config/src/config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    IAmPrismaModule,
    AuthenticationModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [{ provide: HashingService, useClass: BcryptService }],
  controllers: [],
})
export class IAmModule {}
