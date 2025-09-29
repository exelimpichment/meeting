import { MESSENGER_ENV, MessengerEnv } from '@/apps/messenger/env.schema';
import { MessengerModule } from '@/apps/messenger/src/messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(MessengerModule);
  const env = app.get<MessengerEnv>(MESSENGER_ENV);

  // connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [env.KAFKA_BROKER],
      },
      consumer: {
        groupId: env.KAFKA_GROUP_ID,
      },
    },
  });

  // connect NATS microservice for receiving events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [env.NATS_SERVER],
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
