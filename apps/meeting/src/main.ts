import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '@apps/meeting/src/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    },
  );

  await app.listen();
}
bootstrap();
