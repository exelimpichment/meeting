import { MessengerPrismaModule } from '@/apps/messenger/src/prisma/messenger-prisma.module';
import { ConversationsModule } from '@/apps/messenger/src/conversations/conversations.module';
import { MessengerEnv, MessengerEnvSchema } from '@/apps/messenger/env.schema';
import { MessagesModule } from '@/apps/messenger/src/messages/messages.module';
import { ConfigModule as CustomConfigModule } from '@config/config.module';
import { KafkaModule } from '@/apps/messenger/src/kafka/kafka.module';
import { KeyvCacheModule } from '@/libs/cache/src/keyv-cache.module';
import { NatsModule } from '@/apps/messenger/src/nats/nats.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LoggingModule } from '@app/logging/logging.module';
import { ConfigService } from '@config/config.service';
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
    NatsModule,
    LoggingModule.forRoot({
      serviceName: 'messenger',
      prettyPrint: process.env.NODE_ENV !== 'production',
    }),

    KafkaModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (configService: ConfigService<MessengerEnv>) => {
        const kafkaBroker = configService.get('KAFKA_BROKER');
        const kafkaGroupId = configService.get('KAFKA_GROUP_ID');

        return {
          // https://www.confluent.io/blog/how-choose-number-topics-partitions-kafka-cluster/
          consumer: {
            conf: {
              'bootstrap.servers': kafkaBroker,
              kafkaJS: {
                groupId: kafkaGroupId,
                allowAutoTopicCreation: false,
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),

    KeyvCacheModule.forRootAsync({
      imports: [CustomConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<MessengerEnv>) => {
        const url = config.get('CACHE_REDIS_URL');
        const ttlMs = config.get('CACHE_TTL_MS');

        return {
          url,
          namespace: 'meeting-api-gateway',
          ttlMs,
        };
      },
      isGlobal: true,
    }),
  ],
})
export class MessengerModule {}
