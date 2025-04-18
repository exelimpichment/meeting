import { NestFactory } from '@nestjs/core';
import { MeetingApiGatewayModule } from './meeting-api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(MeetingApiGatewayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
