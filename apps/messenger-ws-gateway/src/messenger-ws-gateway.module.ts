import { MessengerWsGatewayEnvSchema } from '@/apps/messenger-ws-gateway/messenger-ws-gateway.schema';
import { SharedAuthenticationModule } from '@/libs/shared-authentication/src/shared-authentication.module';
import { KafkaModule } from '@/apps/messenger-ws-gateway/src/kafka/kafka.module';
import { MessengerWsGatewayController } from './messenger-ws-gateway.controller';
import { MessengerWsGatewayService } from './messenger-ws-gateway.service';
import { ConfigModule as CustomConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { cwd } from 'process';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(
        cwd(),
        'apps/messenger-ws-gateway/.env.messenger-ws-gateway',
      ),
      validate: (config) => {
        // apply defaults for missing environment variables
        const result = MessengerWsGatewayEnvSchema.safeParse(config);
        if (!result.success) {
          console.error(
            'Environment validation error:',
            result.error.flatten().fieldErrors,
          );
          throw new Error(
            'Invalid environment variables for messenger-ws-gateway',
          );
        }
        // merge parsed data with original config to preserve all env vars
        return { ...config, ...result.data };
      },
    }),
    CustomConfigModule,

    KafkaModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (configService: ConfigService) => {
        const kafkaBroker =
          (configService.get('KAFKA_BROKER') as string) || 'localhost:29092';

        return {
          producer: {
            conf: {
              acks: -1, // The producer will receive a success response from the broker once all in sync replicas receive the message.
              'bootstrap.servers': kafkaBroker,
              'client.id': 'messenger-ws-gateway-producer',
              'linger.ms': 10,
              kafkaJS: {
                idempotent: true,
                allowAutoTopicCreation: false,
                // max.request.size (producer property) has to be equal to message_meta.max.bytes
              },
            },
          },
          // https://www.confluent.io/blog/how-choose-number-topics-partitions-kafka-cluster/
          // consumer: {
          //   conf: {
          //     'bootstrap.servers': kafkaBroker,
          //     // 'group.id': 'messenger-ws-gateway-group',
          //     // 'client.id': 'messenger-ws-gateway-consumer',
          //     kafkaJS: {
          //       // groupId: 'messenger-ws-gateway-group',
          //       allowAutoTopicCreation: false,
          //     },
          //   },
          // },
        };
      },
      inject: [ConfigService],
    }),
    SharedAuthenticationModule.forRoot(), // handles JWT validation internally
    MessagesModule,
  ],
  controllers: [MessengerWsGatewayController],
  providers: [MessengerWsGatewayService],
})
export class MessengerWsGatewayModule {}
