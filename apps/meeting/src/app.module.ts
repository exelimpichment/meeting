import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigModule } from '@libs/config';
import { envSchema } from '../env.schema';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting/.env',
      validate: (env) => envSchema.parse(env),
    }),
    ConfigModule,
    UsersModule,
  ],
})
export class AppModule {}
