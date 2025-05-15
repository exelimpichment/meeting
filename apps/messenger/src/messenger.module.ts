import { Module } from '@nestjs/common';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MessengerEnvSchema } from '../env.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/messenger/.env.messenger',
      validate: (env) => MessengerEnvSchema.parse(env),
    }),
  ],
  controllers: [MessengerController],
  providers: [MessengerService],
})
export class MessengerModule {}
