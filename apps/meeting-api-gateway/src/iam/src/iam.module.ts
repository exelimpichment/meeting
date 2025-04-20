import { Module } from '@nestjs/common';
import { IAmService } from './iam.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { IAmEnvSchema } from './env.schema';
import { ConfigModule } from '@app/config';
import { IAmPrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HashingService } from '../../../../../libs/hashing/src/hashing.service';
import { BcryptService } from '../../../../../libs/hashing/src/bcrypt.service';
import { AuthenticationModule } from './authentication/authentication.module';

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
  providers: [IAmService, { provide: HashingService, useClass: BcryptService }],
  controllers: [],
})
export class IAmModule {}
