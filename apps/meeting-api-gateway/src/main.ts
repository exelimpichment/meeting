import { NestFactory } from '@nestjs/core';
import { MeetingApiGatewayModule } from './meeting-api-gateway.module';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(MeetingApiGatewayModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 3000);
}

bootstrap();
