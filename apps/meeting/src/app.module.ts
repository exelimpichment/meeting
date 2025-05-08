import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@libs/config';
import { envSchema } from '../env.schema';
import { UsersModule } from './users/users.module';
import { MessagingModule } from './conversations/conversations.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/meeting/.env',
      validate: (env) => envSchema.parse(env),
    }),
    ConfigModule,
    UsersModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
