import { MessengerPrismaModule } from './prisma/messenger-prisma.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { MESSENGER_ENV, MessengerEnvSchema } from '../env.schema';
import { join } from 'path';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'apps/messenger/.env.messenger'),
      validate: (env) => MessengerEnvSchema.parse(env),
    }),
    ConfigModule,
    MessengerPrismaModule,
  ],
  controllers: [MessengerController],
  providers: [
    MessengerService,
    {
      provide: MESSENGER_ENV,
      useFactory: () => MessengerEnvSchema.parse(process.env),
    },
  ],
})
export class MessengerModule {}
