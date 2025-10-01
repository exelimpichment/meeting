import { MessengerPrismaModule } from '@/apps/messenger/src/prisma/messenger-prisma.module';
import { ConversationsModule } from '@/apps/messenger/src/conversations/conversations.module';
import { MessengerEnv, MessengerEnvSchema } from '@/apps/messenger/env.schema';
import { MessagesModule } from '@/apps/messenger/src/messages/messages.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule as CustomConfigModule } from '@config/config.module';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigService } from '@config/config.service';
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
  ],
})
export class MessengerModule {}
