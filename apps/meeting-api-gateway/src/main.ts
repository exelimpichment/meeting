import { NestFactory } from '@nestjs/core';
import { MeetingApiGatewayModule } from './meeting-api-gateway.module';
import { ZodValidationPipe } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WsAdapter } from '@nestjs/platform-ws';
import { ConfigService } from '@nestjs/config';
import { MeetingApiGatewayEnv } from '../meeting-api-gateway.schema';

async function bootstrap() {
  const app = await NestFactory.create(MeetingApiGatewayModule);

  // get configuration service to access validated environment variables
  const configService = app.get(ConfigService<MeetingApiGatewayEnv>);

  // enable CORS with credentials support
  const nodeEnv = configService.get('NODE_ENV' as keyof MeetingApiGatewayEnv);
  const isProduction = nodeEnv === 'production';

  app.enableCors({
    origin: isProduction
      ? ['http://localhost:3001'] // strict in production
      : ['http://localhost:3001', 'http://localhost:3000'], // more flexible in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // important for cookies
    exposedHeaders: ['Set-Cookie'],
  });

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

  // Start both HTTP and microservice
  await app.startAllMicroservices();
  const port = configService.get('PORT') as number;
  await app.listen(port);
}

bootstrap();
