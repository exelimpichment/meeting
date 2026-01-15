import { MeetingApiGatewayModule } from './meeting-api-gateway.module';
import { MeetingApiGatewayEnv } from '../meeting-api-gateway.schema';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@libs/config/src/config.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(MeetingApiGatewayModule);
  app.setGlobalPrefix('api');

  const configService =
    app.get<ConfigService<MeetingApiGatewayEnv>>(ConfigService);

  const PORT = configService.get('PORT');
  const WEB_APP_URL = configService.get('WEB_APP_URL');
  const NATS_URL = configService.get('NATS_URL');

  // enable CORS with credentials support
  app.enableCors({
    origin: WEB_APP_URL ?? 'http://localhost:3009',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [NATS_URL],
    },
  });

  app.useGlobalPipes(new ZodValidationPipe());

  // Start both HTTP and microservice
  await app.startAllMicroservices();
  await app.listen(PORT ?? 3001);
}

void bootstrap();
