import { NestFactory } from '@nestjs/core';
import { MessengerModule } from './messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MESSENGER_ENV, MessengerEnv } from '../env.schema';

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
      // servers: [env.NATS_URL],
      servers: ['nats://localhost:4222'],
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
