import { AuthenticationModule } from '@apps/meeting-api-gateway/src/iam/src/authentication';
import { IAmEnvSchema } from '@apps/meeting-api-gateway/src/iam/src/env.schema';
import { IAmPrismaModule } from '@apps/meeting-api-gateway/src/iam/src/prisma';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { BcryptService } from '@libs/hashing/src/bcrypt.service';
import { UsersModule } from './users/users.module';
import { HashingService } from '@libs/hashing/src';
import { ConfigModule } from '@libs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting-api-gateway/src/iam/.env.iam',
      validate: (env) => IAmEnvSchema.parse(env),
    }),
    ConfigModule,
    IAmPrismaModule,
    UsersModule,
    AuthenticationModule,
  ],
  providers: [{ provide: HashingService, useClass: BcryptService }],
  controllers: [],
})
export class IAmModule {}
