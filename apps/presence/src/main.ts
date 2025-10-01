import { NestFactory } from '@nestjs/core';
import { PresenceModule } from './presence.module';

async function bootstrap() {
  const app = await NestFactory.create(PresenceModule);
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
