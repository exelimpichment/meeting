import { Module } from '@nestjs/common';
import { IAmService } from './iam.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { IAmEnvSchema } from './env.schema';
import { ConfigModule } from '@app/config';
import { IAmPrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './libs/iam/.env.iam',
      validate: (env) => IAmEnvSchema.parse(env),
    }),
    ConfigModule,
    IAmPrismaModule,
    UsersModule,
  ],
  providers: [
    IAmService,
    { provide: HashingService, useClass: BcryptService },
    AuthenticationService,
  ],
  exports: [IAmService, AuthenticationService],
  controllers: [],
})
export class IAmModule {}
