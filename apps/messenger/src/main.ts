import { MessengerModule } from '@/apps/messenger/src/messenger.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(MessengerModule);

  // connect to NATS as a microservice to handle @MessagePattern decorators
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
