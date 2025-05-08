import { NestFactory } from '@nestjs/core';
import { MeetingApiGatewayModule } from './meeting-api-gateway.module';
import { ZodValidationPipe } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(MeetingApiGatewayModule);

  app.useWebSocketAdapter(new WsAdapter(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 3000);
}

bootstrap();
