import { NestFactory } from '@nestjs/core';
import { MessengerModule } from './messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MESSENGER_ENV, MessengerEnv } from '../env.schema';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(MessengerModule);
  const env = appContext.get<MessengerEnv>(MESSENGER_ENV);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessengerModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [env.KAFKA_BROKER],
        },
        consumer: {
          groupId: env.KAFKA_GROUP_ID,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
