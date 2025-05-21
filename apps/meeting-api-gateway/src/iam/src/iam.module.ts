import { AuthenticationModule } from '@apps/meeting-api-gateway/src/iam/src/authentication';
import { IAmPrismaModule } from '@apps/meeting-api-gateway/src/iam/src/prisma';
import { jwtConfig } from '@apps/meeting-api-gateway/src/iam/jwt.config';
import { BcryptService } from '@libs/hashing/src/bcrypt.service';
import { HashingService } from '@libs/hashing/src';
import { ConfigModule } from '@libs/config';
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
