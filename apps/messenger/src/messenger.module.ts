import { MessengerPrismaModule } from '@/apps/messenger/src/prisma/messenger-prisma.module';
import { ConversationsModule } from '@/apps/messenger/src/conversations/conversations.module';
import { MESSENGER_ENV, MessengerEnvSchema } from '@/apps/messenger/env.schema';
import { MessagesModule } from '@/apps/messenger/src/messages/messages.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule as CustomConfigModule } from '@/libs/config/src/config.module';
import { Module } from '@nestjs/common';
import { join } from 'path';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'apps/messenger/.env.messenger'),
      validate: (env) => MessengerEnvSchema.parse(env),
    }),
    CustomConfigModule,
    MessengerPrismaModule,
    MessagesModule,
    ConversationsModule,
  ],
  providers: [
    {
      provide: MESSENGER_ENV,
      useFactory: () => MessengerEnvSchema.parse(process.env),
    },
  ],
})
export class MessengerModule {}
