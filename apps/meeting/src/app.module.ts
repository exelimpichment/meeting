import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ConfigModule as CustomConfigModule } from '@libs/config/src/config.module';
import { envSchema } from '../env.schema';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting/.env',
      validate: (env) => envSchema.parse(env),
    }),
    CustomConfigModule,
    UsersModule,
  ],
})
export class AppModule {}
