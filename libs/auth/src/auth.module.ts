import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { authEnvSchema } from './env.schema';
import { ConfigModule } from '@app/config';
import { AuthPrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './libs/auth/.env.auth',
      validate: (env) => authEnvSchema.parse(env),
    }),
    ConfigModule,
    AuthPrismaModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
