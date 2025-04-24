import { AuthenticationModule } from '@apps/meeting-api-gateway/src/iam/src/authentication';
import { IAmEnvSchema } from '@apps/meeting-api-gateway/src/iam/src/env.schema';
import { IAmPrismaModule } from '@apps/meeting-api-gateway/src/iam/src/prisma';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { BcryptService } from '@libs/hashing/src/bcrypt.service';
import { HashingService } from '@libs/hashing/src';
import { ConfigModule } from '@libs/config';
import { Module } from '@nestjs/common';
import { jwtConfig } from '@apps/meeting-api-gateway/src/iam/jwt.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting-api-gateway/src/iam/.env.iam',
      validate: (env) => IAmEnvSchema.parse(env),
      load: [jwtConfig],
    }),
    ConfigModule,
    IAmPrismaModule,
    AuthenticationModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [{ provide: HashingService, useClass: BcryptService }],
  controllers: [],
})
export class IAmModule {}
